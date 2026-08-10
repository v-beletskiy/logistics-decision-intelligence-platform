import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from "@nestjs/common";
import type { ConfirmChannel, ConsumeMessage } from "amqplib";

import { APP_CONFIG, type AppConfig } from "../../../config/app-config";
import {
  inboxConsumerId,
  type InboxConsumerId,
} from "./inbox/inbox-message";
import { InboxProcessor } from "./inbox/inbox-processor";
import type {
  CloudEvent,
  IntegrationEventsOf,
} from "@logistics-decision-intelligence/integration-events";
import {
  eventTypesForContracts,
  InvalidIntegrationEventException,
  IntegrationEventValidator,
  type IntegrationEventContract,
} from "./integration-event-validator";
import { NonRetryableMessageException } from "../errors";
import { RabbitMqConnection } from "../rabbitmq/connection";
import { IntegrationTopology } from "../rabbitmq/topology";
import { RabbitMqTopologyProvisioner } from "../rabbitmq/topology-provisioner";
import {
  rabbitMqQueueName,
  type RabbitMqQueueName,
} from "./subscription-identity";

export interface RabbitMqSubscription<
  TContracts extends readonly IntegrationEventContract[] = readonly IntegrationEventContract[],
> {
  readonly consumerId: InboxConsumerId;
  readonly queue: RabbitMqQueueName;
  readonly eventContracts: TContracts;
  readonly handle: (event: IntegrationEventsOf<TContracts>) => Promise<void>;
}

interface RuntimeSubscription {
  readonly consumerId: InboxConsumerId;
  readonly queue: RabbitMqQueueName;
  readonly eventContracts: readonly IntegrationEventContract[];
  readonly handle: (event: CloudEvent) => Promise<void>;
}

interface SubscriptionState {
  readonly subscription: RuntimeSubscription;
  readonly validator: IntegrationEventValidator<
    readonly IntegrationEventContract[]
  >;
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

  async subscribe<
    const TContracts extends readonly IntegrationEventContract[],
  >(subscription: RabbitMqSubscription<TContracts>): Promise<void> {
    inboxConsumerId(subscription.consumerId);
    rabbitMqQueueName(subscription.queue);
    if (this.stopping) {
      throw new Error("RabbitMQ integration-event consumer is shutting down.");
    }
    if (this.subscriptions.has(subscription.queue)) {
      throw new Error(
        `RabbitMQ queue ${subscription.queue} is already subscribed in this process.`,
      );
    }
    if (
      [...this.subscriptions.values()].some(
        (state) => state.subscription.consumerId === subscription.consumerId,
      )
    ) {
      throw new Error(
        `Inbox consumer ${subscription.consumerId} is already subscribed in this process.`,
      );
    }

    const runtimeSubscription: RuntimeSubscription = {
      consumerId: subscription.consumerId,
      queue: subscription.queue,
      eventContracts: subscription.eventContracts,
      handle: (event) =>
        subscription.handle(event as IntegrationEventsOf<TContracts>),
    };

    const state: SubscriptionState = {
      subscription: runtimeSubscription,
      validator: new IntegrationEventValidator(subscription.eventContracts),
      registered: false,
    };
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
        eventTypes: eventTypesForContracts(subscription.eventContracts),
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
        void this.consume(message, state, channel).catch((error: unknown) => {
          this.logger.error(
            `Unhandled RabbitMQ consumer failure for queue ${subscription.queue}.`,
            error instanceof Error ? error.stack : undefined,
          );
        });
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
    state: SubscriptionState,
    channel: ConfirmChannel,
  ): Promise<void> {
    try {
      if (
        message.content.length > this.config.messaging.maxIncomingMessageBytes
      ) {
        throw new NonRetryableMessageException(
          "RabbitMQ message exceeds the configured size limit.",
        );
      }
      const event = this.parseEvent(message, state.validator);
      await this.inboxProcessor.process(
        state.subscription.consumerId,
        event,
        state.subscription.handle,
      );
      channel.ack(message);
    } catch (error: unknown) {
      if (error instanceof NonRetryableMessageException) {
        const validationContext =
          error instanceof InvalidIntegrationEventException
            ? ` (${error.reason}${error.schemaId === undefined ? "" : `, ${error.schemaId}`})`
            : "";
        this.logger.warn(
          `Dead-lettering non-retryable integration event ${message.properties.messageId ?? "without id"}${validationContext}.`,
        );
        channel.nack(message, false, false);
        return;
      }

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
        await this.scheduleRetry(
          message,
          retryCount + 1,
          state.subscription.queue,
          channel,
        );
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

  private parseEvent(
    message: ConsumeMessage,
    validator: IntegrationEventValidator<
      readonly IntegrationEventContract[]
    >,
  ): CloudEvent {
    try {
      return validator.parse(JSON.parse(message.content.toString("utf8")));
    } catch (error: unknown) {
      if (error instanceof NonRetryableMessageException) {
        throw error;
      }
      throw new NonRetryableMessageException(
        "RabbitMQ message does not contain valid JSON.",
      );
    }
  }

  private getRetryCount(message: ConsumeMessage): number {
    const value = message.properties.headers?.["x-retry-count"];
    return typeof value === "number" ? value : 0;
  }

  private async scheduleRetry(
    message: ConsumeMessage,
    retryCount: number,
    queueName: RabbitMqQueueName,
    channel: ConfirmChannel,
  ): Promise<void> {
    const delay =
      this.config.messaging.retryBaseDelayMs * 2 ** (retryCount - 1);
    const published = channel.sendToQueue(
      IntegrationTopology.retryQueueName(queueName),
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
