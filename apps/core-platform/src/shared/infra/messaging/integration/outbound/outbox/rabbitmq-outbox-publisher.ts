import {
  drainBatches,
  type DrainBatchesResult,
} from "@logistics-decision-intelligence/background-processing";
import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import type { ConfirmChannel } from "amqplib";

import { APP_CONFIG, type AppConfig } from "../../../../config/app-config";
import { RabbitMqConnection } from "../../rabbitmq/connection";
import { IntegrationTopology } from "../../rabbitmq/topology";
import { RabbitMqTopologyProvisioner } from "../../rabbitmq/topology-provisioner";
import type { ClaimedOutboxEvent } from "./outbox-store";
import { OutboxStore } from "./outbox-store";

/**
 * Publishes claimed outbox events to RabbitMQ in bounded batches with
 * at-least-once delivery.
 *
 * Each drain claims and processes up to the configured batch size and maximum
 * number of batches. RabbitMQ publisher confirmation is required before an
 * outbox record is marked PUBLISHED.
 *
 * Failed or unconfirmed events are retried. If RabbitMQ accepts an event but
 * marking it PUBLISHED fails, its lease expires and it is published again.
 * Consumers must deduplicate by CloudEvent id through the Inbox pattern.
 */
@Injectable()
export class RabbitMqOutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqOutboxPublisher.name);
  private timer?: NodeJS.Timeout;
  private scheduledDrain?: Promise<void>;
  private activeDrain?: Promise<DrainBatchesResult>;
  private channel?: ConfirmChannel;
  private channelInitialization?: Promise<ConfirmChannel>;
  private stopping = false;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly outboxStore: OutboxStore,
    private readonly connection: RabbitMqConnection,
    private readonly topologyProvisioner: RabbitMqTopologyProvisioner,
  ) {}

  onModuleInit(): void {
    this.stopping = false;
    this.scheduleDrain(0);
  }

  async onModuleDestroy(): Promise<void> {
    this.stopping = true;
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    await this.scheduledDrain;
    await this.activeDrain;

    const channel = this.channel;
    this.channel = undefined;
    this.channelInitialization = undefined;
    await channel?.close().catch(() => undefined);
  }

  /**
   * Coalesces concurrent triggers into one drain. A full final batch causes the
   * lifecycle scheduler to run another bounded drain immediately.
   */
  async publishPending(): Promise<DrainBatchesResult> {
    if (this.activeDrain !== undefined) {
      return this.activeDrain;
    }

    const operation = this.drainPendingBatches();
    this.activeDrain = operation;
    try {
      return await operation;
    } finally {
      if (this.activeDrain === operation) {
        this.activeDrain = undefined;
      }
    }
  }

  private async drainPendingBatches(): Promise<DrainBatchesResult> {
    return drainBatches({
      batchSize: this.config.messaging.outboxBatchSize,
      maxBatches: this.config.messaging.outboxMaxBatchesPerDrain,
      loadBatch: (limit) => this.outboxStore.claimPendingBatch(limit),
      processBatch: (claims) => this.publishBatch(claims),
    });
  }

  private scheduleDrain(delayMs: number): void {
    if (this.stopping) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      const operation = this.runScheduledDrain();
      this.scheduledDrain = operation;
      void operation.then(() => {
        if (this.scheduledDrain === operation) {
          this.scheduledDrain = undefined;
        }
      });
    }, delayMs);
  }

  private async runScheduledDrain(): Promise<void> {
    let nextDelayMs = this.config.messaging.outboxPollIntervalMs;

    try {
      const result = await this.publishPending();
      if (result.reachedBatchLimit) {
        nextDelayMs = 0;
      }
    } catch (error: unknown) {
      this.logger.error(
        "Unable to drain pending integration events from the outbox.",
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.scheduleDrain(nextDelayMs);
    }
  }

  private async publishBatch(
    claims: readonly ClaimedOutboxEvent[],
  ): Promise<void> {
    try {
      const channel = await this.getChannel();
      for (const { event } of claims) {
        const writable = channel.publish(
          IntegrationTopology.exchanges.integration.name,
          event.type,
          Buffer.from(JSON.stringify(event)),
          {
            contentType: "application/cloudevents+json",
            messageId: event.id,
            persistent: true,
          },
        );
        if (!writable) {
          await new Promise<void>((resolve) => channel.once("drain", resolve));
        }
      }

      // RabbitMQ has no multi-message publish command. Publishing to a confirm
      // channel and awaiting once here amortizes the confirm round trip.
      await channel.waitForConfirms();
    } catch (error: unknown) {
      const publishError =
        error instanceof Error
          ? error
          : new Error("Unknown RabbitMQ publication error.");
      await this.rescheduleBatch(claims, publishError);
      throw publishError;
    }

    await this.markBatchPublished(claims);
  }

  private async markBatchPublished(
    claims: readonly ClaimedOutboxEvent[],
  ): Promise<void> {
    let firstError: unknown;

    for (const { event, lockToken } of claims) {
      try {
        if (!(await this.outboxStore.markPublished(event.id, lockToken))) {
          this.logger.warn(
            `Outbox claim for integration event ${event.id} expired before it could be marked as published.`,
          );
        }
      } catch (error: unknown) {
        firstError ??= error;
        this.logger.error(
          `Unable to mark integration event ${event.id} as published.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    if (firstError !== undefined) {
      throw firstError;
    }
  }

  private async rescheduleBatch(
    claims: readonly ClaimedOutboxEvent[],
    publishError: Error,
  ): Promise<void> {
    const retryAfter = new Date(
      Date.now() + this.config.messaging.retryBaseDelayMs,
    );

    for (const { event, lockToken } of claims) {
      try {
        if (
          !(await this.outboxStore.reschedule(
            event.id,
            lockToken,
            retryAfter,
            publishError,
          ))
        ) {
          this.logger.warn(
            `Outbox claim for integration event ${event.id} expired before it could be rescheduled.`,
          );
        }
      } catch (error: unknown) {
        this.logger.error(
          `Unable to reschedule integration event ${event.id} after a publication failure.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  private async getChannel(): Promise<ConfirmChannel> {
    if (this.channel !== undefined) {
      return this.channel;
    }

    const initialization =
      this.channelInitialization ?? this.initializeChannel();
    this.channelInitialization = initialization;
    try {
      return await initialization;
    } finally {
      if (this.channelInitialization === initialization) {
        this.channelInitialization = undefined;
      }
    }
  }

  private async initializeChannel(): Promise<ConfirmChannel> {
    const channel = await this.connection.createConfirmChannel();
    this.channel = channel;
    channel.on("error", (error: Error) => {
      this.logger.error("RabbitMQ publisher channel error.", error.stack);
    });
    channel.once("close", () => {
      if (this.channel === channel) {
        this.channel = undefined;
      }
    });

    try {
      await this.topologyProvisioner.assertExchanges(channel);
      return channel;
    } catch (error: unknown) {
      if (this.channel === channel) {
        this.channel = undefined;
      }
      await channel.close().catch(() => undefined);
      throw error;
    }
  }
}
