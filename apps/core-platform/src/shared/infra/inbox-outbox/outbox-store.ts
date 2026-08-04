import type { IntegrationEvent } from '../messaging/integration-event';

export interface ClaimedOutboxEvent {
  readonly event: IntegrationEvent;
  readonly lockToken: string;
}

export abstract class OutboxStore {
  abstract enqueue(event: IntegrationEvent): Promise<void>;
  abstract claimPendingBatch(
    limit: number,
  ): Promise<readonly ClaimedOutboxEvent[]>;
  abstract markPublished(eventId: string, lockToken: string): Promise<boolean>;
  abstract reschedule(
    eventId: string,
    lockToken: string,
    availableAt: Date,
    error: Error,
  ): Promise<boolean>;
}
