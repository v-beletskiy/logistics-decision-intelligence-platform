import type { PreparedQuery } from "@pgtyped/runtime";

import type { PgDatabase } from "../pg-database";

export interface RootPersistenceStatements<TParams> {
  readonly insertStatement: PreparedQuery<TParams, void>;
  readonly updateStatement: PreparedQuery<TParams, void>;
  readonly params: TParams;
}

/** Persists an aggregate's single root row as an explicit insert or update. */
export async function persistRoot<TParams>(
  database: PgDatabase,
  isNew: boolean,
  statements: RootPersistenceStatements<TParams>,
): Promise<void> {
  await database.exec(
    isNew ? statements.insertStatement : statements.updateStatement,
    statements.params,
  );
}

export interface ChildPersistenceStatements<TInsertRow, TUpdateRow> {
  readonly inserts: readonly TInsertRow[];
  readonly updates: readonly TUpdateRow[];
  readonly removedIds: readonly string[];
  readonly insertStatement?: PreparedQuery<
    { rows: readonly TInsertRow[] },
    void
  >;
  readonly updateStatement?: PreparedQuery<
    { rows: readonly TUpdateRow[] },
    void
  >;
  readonly deleteStatement?: PreparedQuery<{ ids: readonly string[] }, void>;
}

/**
 * Persists the changed children of an aggregate as explicit batched commands.
 * A statement is required only for operations the aggregate's plan actually
 * uses.
 */
export async function persistChildChanges<TInsertRow, TUpdateRow>(
  database: PgDatabase,
  statements: ChildPersistenceStatements<TInsertRow, TUpdateRow>,
): Promise<void> {
  if (statements.inserts.length > 0) {
    if (!statements.insertStatement) {
      throw new Error(
        `No insertStatement provided for ${statements.inserts.length} child inserts.`,
      );
    }
    await database.exec(statements.insertStatement, {
      rows: statements.inserts,
    });
  }

  if (statements.updates.length > 0) {
    if (!statements.updateStatement) {
      throw new Error(
        `No updateStatement provided for ${statements.updates.length} child updates.`,
      );
    }
    await database.exec(statements.updateStatement, {
      rows: statements.updates,
    });
  }

  if (statements.removedIds.length > 0) {
    if (!statements.deleteStatement) {
      throw new Error(
        `No deleteStatement provided for ${statements.removedIds.length} child removals.`,
      );
    }
    await database.exec(statements.deleteStatement, {
      ids: statements.removedIds,
    });
  }
}
