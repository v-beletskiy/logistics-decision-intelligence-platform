import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from "@nestjs/common";
import type { ConfirmChannel, ConsumeMessage } from "amqplib";

import { APP_CONFIG, type AppConfig } from "../config/app-config";
import { InboxProcessor } from "../inbox-outbox/inbox-processor";
import type { IntegrationEvent } from "./integration-event";
import { IntegrationTopology } from "./integration-topology";
import { RabbitMqConnection } from "./rabbitmq-connection";
import { RabbitMqTopologyProvisioner } from "./rabbitmq-topology-provisioner";

export interface RabbitMqSubscription {
  readonly queue: string;
  readonly eventTypes: readonly string[];
  handle(event: IntegrationEvent): Promise<void>;
}

interface SubscriptionState {
  readonly subscription: RabbitMqSubscription;
  channel?: ConfirmChannel;
  consumerTag?: string;
  reconnectTimer?: NodeJS.Timeout;
  starting?: Promise<void>;
  registered: boolean;
}

@Injectable()
export class RabbitMqIntegrationEventConsumer implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqIntegrationEventConsumer.name);
  private readonly subscriptions = new Map<string, SubscriptionState>();
  private stopping = false;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly connection: RabbitMqConnection,
    private readonly inboxProcessor: InboxProcessor,
    private readonly topologyProvisioner: RabbitMqTopologyProvisioner,
  ) {}

  async subscribe(subscription: RabbitMqSubscription): Promise<void> {
    if (this.stopping) {
      throw new Error("RabbitMQ integration-event consumer is shutting down.");
    }
    if (this.subscriptions.has(subscription.queue)) {
      throw new Error(
        `RabbitMQ queue ${subscription.queue} is already subscribed in this process.`,
      );
    }

    const state: SubscriptionState = { subscription, registered: false };
    this.subscriptions.set(subscription.queue, state);
    try {
      await this.execOpeningSubscription(state);
    } catch (error: unknown) {
      this.subscriptions.delete(subscription.queue);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.stopping = true;
    const states = [...this.subscriptions.values()];

    for (const state of states) {
      if (state.reconnectTimer !== undefined) {
        clearTimeout(state.reconnectTimer);
        state.reconnectTimer = undefined;
      }
    }
    await Promise.all(
      states.map(async (state) => state.starting?.catch(() => undefined)),
    );
    await Promise.all(
      states.map(async (state) => {
        const channel = state.channel;
        const consumerTag = state.consumerTag;
        state.channel = undefined;
        state.consumerTag = undefined;
        if (channel === undefined) return;

        if (consumerTag !== undefined) {
          await channel.cancel(consumerTag).catch(() => undefined);
        }
        await channel.close().catch(() => undefined);
      }),
    );
    this.subscriptions.clear();
  }

  private async execOpeningSubscription(
    state: SubscriptionState,
  ): Promise<void> {
    const operation = this.openSubscription(state);
    state.starting = operation;
    try {
      await operation;
    } finally {
      if (state.starting === operation) {
        state.starting = undefined;
      }
    }
  }

  private async openSubscription(state: SubscriptionState): Promise<void> {
    const { subscription } = state;
    const channel = await this.connection.createConfirmChannel();
    state.channel = channel;
    channel.on("error", (error: Error) => {
      this.logger.error(
        `RabbitMQ consumer channel error for queue ${subscription.queue}.`,
        error.stack,
      );
    });
    channel.once("close", () => {
      if (state.channel !== channel) return;
      state.channel = undefined;
      state.consumerTag = undefined;
      if (state.registered) {
        this.scheduleReconnect(state);
      }
    });

    try {
      await this.topologyProvisioner.assertSubscription(channel, {
        queueName: subscription.queue,
        eventTypes: subscription.eventTypes,
      });
      await channel.prefetch(1);
      const consumer = await channel.consume(subscription.queue, (message) => {
        if (message === null) {
          this.logger.warn(
            `RabbitMQ cancelled consumer for queue ${subscription.queue}; reconnecting.`,
          );
          void channel.close().catch(() => undefined);
          return;
        }
        void this.consume(message, subscription, channel).catch(
          (error: unknown) => {
            this.logger.error(
              `Unhandled RabbitMQ consumer failure for queue ${subscription.queue}.`,
              error instanceof Error ? error.stack : undefined,
            );
          },
        );
      });
      state.consumerTag = consumer.consumerTag;
      state.registered = true;
    } catch (error: unknown) {
      if (state.channel === channel) {
        state.channel = undefined;
      }
      state.consumerTag = undefined;
      await channel.close().catch(() => undefined);
      throw error;
    }
  }

  private scheduleReconnect(state: SubscriptionState): void {
    if (this.stopping || state.reconnectTimer !== undefined) return;

    state.reconnectTimer = setTimeout(() => {
      state.reconnectTimer = undefined;
      const operation = this.execOpeningSubscription(state);
      void operation.catch((error: unknown) => {
        this.logger.error(
          `Unable to restore RabbitMQ consumer for queue ${state.subscription.queue}.`,
          error instanceof Error ? error.stack : undefined,
        );
        this.scheduleReconnect(state);
      });
    }, this.config.messaging.reconnectDelayMs);
  }

  private async consume(
    message: ConsumeMessage,
    subscription: RabbitMqSubscription,
    channel: ConfirmChannel,
  ): Promise<void> {
    try {
      const event = this.parseEvent(message);
      await this.inboxProcessor.process(event, subscription.handle);
      channel.ack(message);
    } catch (error: unknown) {
      const retryCount = this.getRetryCount(message);
      if (retryCount >= this.config.messaging.maxDeliveryAttempts) {
        this.logger.error(
          `Message ${message.properties.messageId ?? "without id"} exceeded retry limit.`,
          error instanceof Error ? error.stack : undefined,
        );
        channel.nack(message, false, false);
        return;
      }

      try {
        await this.scheduleRetry(message, retryCount + 1, channel);
        channel.ack(message);
      } catch (retryError: unknown) {
        this.logger.error(
          "Unable to schedule RabbitMQ message retry.",
          retryError instanceof Error ? retryError.stack : undefined,
        );
        channel.nack(message, false, true);
      }
    }
  }

  private parseEvent(message: ConsumeMessage): IntegrationEvent {
    const parsed: unknown = JSON.parse(message.content.toString("utf8"));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("eventId" in parsed) ||
      !("eventType" in parsed)
    ) {
      throw new Error(
        "RabbitMQ message does not contain a valid integration event.",
      );
    }

    const event = parsed as Omit<IntegrationEvent, "occurredAt"> & {
      occurredAt: string;
    };
    return { ...event, occurredAt: new Date(event.occurredAt) };
  }

  private getRetryCount(message: ConsumeMessage): number {
    const value = message.properties.headers?.["x-retry-count"];
    return typeof value === "number" ? value : 0;
  }

  private async scheduleRetry(
    message: ConsumeMessage,
    retryCount: number,
    channel: ConfirmChannel,
  ): Promise<void> {
    const delay =
      this.config.messaging.retryBaseDelayMs * 2 ** (retryCount - 1);
    const published = channel.publish(
      IntegrationTopology.exchanges.retry.name,
      message.fields.routingKey,
      message.content,
      {
        contentType: message.properties.contentType ?? "application/json",
        messageId: message.properties.messageId,
        persistent: true,
        expiration: String(delay),
        headers: {
          ...message.properties.headers,
          "x-retry-count": retryCount,
        },
      },
    );
    if (!published) {
      await new Promise<void>((resolve) => channel.once("drain", resolve));
    }
    await channel.waitForConfirms();
  }
}
