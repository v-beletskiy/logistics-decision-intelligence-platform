import { MalformedPersistenceDataException } from "./persistence.exceptions.js";

/** Translates failures while rebuilding domain objects from persisted data. */
export function hydratePersistenceData<T>(
  subject: string,
  hydrate: () => T,
): T {
  try {
    return hydrate();
  } catch (error: unknown) {
    if (error instanceof MalformedPersistenceDataException) throw error;

    const detail = error instanceof Error ? error.message : String(error);
    throw new MalformedPersistenceDataException(
      `Persisted ${subject} is malformed: ${detail}`,
      { cause: error },
    );
  }
}

/** Converts PostgreSQL JSON timestamp text without accepting JS epoch coercion. */
export function parsePersistedTimestamp(value: unknown): Date {
  if (typeof value !== "string") {
    throw new TypeError("Expected a timestamp string.");
  }
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime())) {
    throw new TypeError("Expected a valid timestamp string.");
  }
  return timestamp;
}
