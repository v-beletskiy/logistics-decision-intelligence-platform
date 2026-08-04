import type { DomainEvent } from '../../domain/shared-kernel/events/domain-event';

/** Dispatches domain events after their aggregate changes are committed. */
export abstract class DomainEventBus {
  abstract publish(event: DomainEvent): Promise<void>;
}
