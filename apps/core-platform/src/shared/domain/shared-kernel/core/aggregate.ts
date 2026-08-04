import type { DomainEvent } from "../events/domain-event";

import { Entity, type EntityId } from "./entity";
import type { PersistencePlan } from "./persistence-plan";

/**
 * Entity that is a consistency boundary and records its uncommitted domain
 * events. Application code persists the aggregate before dispatching events.
 */
export abstract class Aggregate<
  TId extends EntityId<TId>,
  TDomainEvent extends DomainEvent,
> extends Entity<TId> {
  private readonly domainEvents: TDomainEvent[] = [];
  private readonly isNewFlag: boolean;

  protected constructor(id: TId, isNew = false) {
    super(id);
    this.isNewFlag = isNew;
  }

  getPersistencePlan(): PersistencePlan {
    return { isNew: this.isNewFlag };
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
