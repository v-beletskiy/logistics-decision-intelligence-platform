import type { InboxMessage, InboxMessageKey } from "./inbox-message.js";

export enum InboxClaimResult {
  Claimed = "CLAIMED",
  AlreadyProcessedOrActive = "ALREADY_PROCESSED_OR_ACTIVE",
}

export abstract class InboxStore {
  /** Claims a message briefly, or observes an already completed/active claim. */
  abstract claim(
    message: InboxMessage,
    leaseMs: number,
  ): Promise<InboxClaimResult>;
  abstract markCompleted(message: InboxMessageKey): Promise<void>;
  abstract release(message: InboxMessageKey): Promise<void>;
}
