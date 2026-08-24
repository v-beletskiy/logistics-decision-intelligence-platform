import { Inject, Injectable } from "@nestjs/common";
import {
  IntegrationEventDecoder,
  type CloudEvent,
} from "@logistics-decision-intelligence/integration-events";

import { IntegrationEventPublisher } from "../../../../../app/messaging/integration-event-publisher.js";
import { APP_CONFIG, type AppConfig } from "../../../../config/app-config.js";
import { corePlatformOutboundContracts } from "../core-platform-outbound-contracts.js";
import { OutboxStore } from "./outbox-store.js";

/**
 * Distributed event delivery starts by persisting an event in the transaction
 * that changed the business state. RabbitMQ publication is performed later.
 */
@Injectable()
export class TransactionalOutboxIntegrationEventPublisher extends IntegrationEventPublisher {
  private readonly decoder = new IntegrationEventDecoder(
    corePlatformOutboundContracts,
  );

  constructor(
    private readonly outboxStore: OutboxStore,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {
    super();
  }

  async publishMany(events: readonly CloudEvent[]): Promise<void> {
    for (const event of events) {
      this.decoder.assert(event);
    }
    for (const event of events) {
      if (
        Buffer.byteLength(JSON.stringify(event)) >
        this.config.messaging.maxOutgoingMessageBytes
      ) {
        throw new Error(
          "Integration event exceeds the configured outgoing message size limit.",
        );
      }
    }
    await this.outboxStore.enqueueMany(events);
  }
}
