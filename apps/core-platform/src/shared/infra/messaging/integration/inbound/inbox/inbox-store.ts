import type { InboxMessage, InboxMessageKey } from "./inbox-message";

export abstract class InboxStore {
  /** Atomically returns false when this consumer already finalized the event. */
  abstract tryStart(message: InboxMessage): Promise<boolean>;
  abstract markCompleted(message: InboxMessageKey): Promise<void>;
}
