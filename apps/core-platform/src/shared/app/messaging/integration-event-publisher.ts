import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";

/** Publishes integration events through the application's reliable output port. */
export abstract class IntegrationEventPublisher {
  abstract publish(event: CloudEvent): Promise<void>;
}
