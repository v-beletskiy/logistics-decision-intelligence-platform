import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { PreparedQuery } from "@pgtyped/runtime";

import { ConcurrencyConflictException } from "../../app/app.exceptions.js";
import type { PgDatabase } from "./pg-database.js";
import { PG_SQLSTATE } from "./pg-error.js";
import {
  execAndTranslatePgConstraintViolations,
  execRevisionedPgUpdate,
} from "./pg-repository-write.js";

interface TestParams {
  readonly id: string;
}

interface RevisionResult {
  readonly revision: string;
}

const statement = {} as PreparedQuery<TestParams, RevisionResult>;
const params = { id: "aggregate-id" };

function databaseReturning(rows: readonly RevisionResult[]): PgDatabase {
  return {
    exec: async () => rows,
  } as unknown as PgDatabase;
}

function databaseThrowing(error: unknown): PgDatabase {
  return {
    exec: async () => {
      throw error;
    },
  } as unknown as PgDatabase;
}

test("execAndTranslatePgConstraintViolations translates an exact constraint", async () => {
  const cause = { code: "23505", constraint: "known_unique" };
  const translated = new Error("Known conflict.");

  await assert.rejects(
    execAndTranslatePgConstraintViolations({
      database: databaseThrowing(cause),
      statement,
      params,
      options: {
        translations: [
          {
            sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
            constraint: "known_unique",
            toError: (error) => {
              assert.equal(error, cause);
              return translated;
            },
          },
        ],
      },
    }),
    (error: unknown) => error === translated,
  );
});

test("execAndTranslatePgConstraintViolations propagates unknown failures", async () => {
  const cause = { code: "23505", constraint: "unknown_unique" };

  await assert.rejects(
    execAndTranslatePgConstraintViolations({
      database: databaseThrowing(cause),
      statement,
      params,
      options: {
        translations: [
          {
            sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
            constraint: "known_unique",
            toError: () => new Error("Known conflict."),
          },
        ],
      },
    }),
    (error: unknown) => error === cause,
  );
});

test("execRevisionedPgUpdate returns the new revision", async () => {
  const revision = await execRevisionedPgUpdate({
    database: databaseReturning([{ revision: "4" }]),
    statement,
    params,
    options: { aggregateName: "Test aggregate" },
  });

  assert.equal(revision, "4");
});

test("execRevisionedPgUpdate rejects a missing or stale aggregate", async () => {
  await assert.rejects(
    execRevisionedPgUpdate({
      database: databaseReturning([]),
      statement,
      params,
      options: { aggregateName: "Test aggregate" },
    }),
    (error: unknown) => {
      assert.ok(error instanceof ConcurrencyConflictException);
      assert.equal(
        error.message,
        "Test aggregate was changed or removed by another operation.",
      );
      return true;
    },
  );
});
