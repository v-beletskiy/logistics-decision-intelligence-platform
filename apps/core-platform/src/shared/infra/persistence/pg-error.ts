interface PgErrorShape {
  readonly code?: unknown;
  readonly constraint?: unknown;
}

export const PG_SQLSTATE = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  SERIALIZATION_FAILURE: "40001",
  DEADLOCK_DETECTED: "40P01",
} as const;

export type PgSqlState = (typeof PG_SQLSTATE)[keyof typeof PG_SQLSTATE];

export interface PgConstraintViolationCriteria {
  readonly sqlState: PgSqlState;
  readonly constraint: string;
}

/**
 * Narrows node-postgres errors without coupling callers to the `pg` error
 * class. SQLSTATE identifies the failure category; the schema-owned constraint
 * name identifies the exact invariant an adapter can translate.
 */
export function isPgConstraintViolation(
  error: unknown,
  criteria: PgConstraintViolationCriteria,
): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as PgErrorShape;
  return (
    candidate.code === criteria.sqlState &&
    candidate.constraint === criteria.constraint
  );
}
