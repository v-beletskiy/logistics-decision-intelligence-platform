import type { DomainEvent } from "../../domain/domain-event.js";

/** Dispatches domain events after their aggregate changes are committed. */
export abstract class DomainEventBus {
  abstract publish(event: DomainEvent): Promise<void>;
}
