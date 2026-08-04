export abstract class InboxStore {
  /** Returns false when this event was already processed successfully. */
  abstract tryStart(eventId: string, eventType: string): Promise<boolean>;
  abstract markCompleted(eventId: string): Promise<void>;
}
