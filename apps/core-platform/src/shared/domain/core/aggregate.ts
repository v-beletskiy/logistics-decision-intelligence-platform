import type { DomainEvent } from "../domain-event";

import { Entity, type EntityId } from "./entity";

/**
 * Entity that is a consistency boundary and records its uncommitted domain
 * events. Application code persists the aggregate before dispatching events.
 */
export abstract class Aggregate<
  TId extends EntityId<TId>,
  TDomainEvent extends DomainEvent,
> extends Entity<TId> {
  private readonly domainEvents: TDomainEvent[] = [];

  protected constructor(id: TId) {
    super(id);
  }

  protected recordDomainEvent(event: TDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): readonly TDomainEvent[] {
    return this.domainEvents.splice(0, this.domainEvents.length);
  }

  /** Read-only view of recorded events without consuming them. */
  pendingDomainEvents(): readonly TDomainEvent[] {
    return [...this.domainEvents];
  }
}
