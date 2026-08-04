/**
 * Signals persisted data that does not conform to the model expected by a
 * persistence mapper, e.g. a JSON-aggregated child column that is not an array.
 */
export class MalformedPersistenceDataException extends Error {}
