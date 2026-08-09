import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";

export interface ClaimedOutboxEvent {
  readonly event: CloudEvent;
  readonly lockToken: string;
}

/** Persistence port used by the reliable outbound integration-event flow. */
export abstract class OutboxStore {
  abstract enqueue(event: CloudEvent): Promise<void>;
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
