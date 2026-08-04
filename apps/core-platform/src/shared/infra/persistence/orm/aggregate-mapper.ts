import { MalformedPersistenceDataException } from "../persistence.exceptions";

/**
 * Base for persistence mappers that translate between a domain aggregate and
 * its persisted model.
 *
 * Subclasses expose two static methods:
 * - `toDomain(persistence): Aggregate` — reconstructs the aggregate from a
 *   persisted row; business rules are validated by the domain constructors.
 * - `toPersistence(aggregate): WriteModel` — derives the write rows from the
 *   aggregate's persistence plan.
 *
 * TypeScript cannot enforce static members, so this base only establishes the
 * convention and hosts shared boundary guards.
 */
export abstract class AggregatePersistenceMapper {
  /** Narrows a JSON-aggregated child column into an array, guarding the boundary. */
  protected static requireJsonArray<TChild>(
    value: unknown,
    label: string,
  ): readonly TChild[] {
    if (!Array.isArray(value)) {
      throw new MalformedPersistenceDataException(
        `Persisted ${label} must be a JSON array.`,
      );
    }
    return value as readonly TChild[];
  }
}
