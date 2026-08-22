import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";

/** Publishes integration events through the application's reliable output port. */
export abstract class IntegrationEventPublisher {
  publish(event: CloudEvent): Promise<void> {
    return this.publishMany([event]);
  }

  /** Accepts the complete batch or rejects it before any event is persisted. */
  abstract publishMany(events: readonly CloudEvent[]): Promise<void>;
}
