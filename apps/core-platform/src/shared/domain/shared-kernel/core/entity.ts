/** Identity value required by entities and aggregate roots. */
export interface EntityId<TId> {
  equals(other: TId): boolean;
}

/** Base class for domain objects that are equal by identity. */
export abstract class Entity<TId extends EntityId<TId>> {
  protected constructor(readonly id: TId) {}

  equals(other: Entity<TId>): boolean {
    return this.constructor === other.constructor && this.id.equals(other.id);
  }
}
