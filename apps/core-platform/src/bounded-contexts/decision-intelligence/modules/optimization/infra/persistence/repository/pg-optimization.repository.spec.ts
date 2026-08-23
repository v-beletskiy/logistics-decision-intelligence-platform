import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { RouteReference } from "../../../../../domain/route-reference";
import { Optimization } from "../../../domain/optimization.aggregate";
import type { LoadedOptimization } from "../../../domain/optimization.repository";
import { addOptimization } from "./queries/optimization.add.queries";
import { updateOptimization } from "./queries/optimization.update.queries";
import { PgOptimizationRepository } from "./pg-optimization.repository";

const tenantId = "00000000-0000-4000-8000-000000000010";

function createOptimization(): Optimization {
  return Optimization.queue({
    routeId: RouteReference.from("00000000-0000-4000-8000-000000000011"),
    inputVersion: 1,
  });
}

function trackedDatabase(
  options: {
    readonly addError?: unknown;
    readonly updateSucceeds?: boolean;
  } = {},
): {
  readonly database: PgDatabase;
  readonly calls: readonly unknown[];
} {
  const calls: unknown[] = [];
  const database = {
    exec: async (statement: unknown) => {
      calls.push(statement);
      if (statement === addOptimization) {
        if (options.addError !== undefined) throw options.addError;
        return [];
      }
      if (statement === updateOptimization) {
        return options.updateSucceeds === false ? [] : [{ revision: "2" }];
      }
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

test("add translates only the active-route uniqueness race", async () => {
  const conflict = {
    code: "23505",
    constraint: "optimizations_tenant_active_route_uniq",
  };
  const { database, calls } = trackedDatabase({ addError: conflict });

  await assert.rejects(
    new PgOptimizationRepository(database).add(tenantId, createOptimization()),
    ConcurrencyConflictException,
  );
  assert.deepEqual(calls, [addOptimization]);
});

test("add propagates unrelated constraint violations", async () => {
  const conflict = { code: "23505", constraint: "optimizations_pkey" };
  const { database } = trackedDatabase({ addError: conflict });

  await assert.rejects(
    new PgOptimizationRepository(database).add(tenantId, createOptimization()),
    (error: unknown) => error === conflict,
  );
});

test("save returns the new revision", async () => {
  const aggregate = createOptimization();
  const loaded: LoadedOptimization = {
    aggregate,
    expectedRevision: "1",
  };
  const { database, calls } = trackedDatabase();

  const revision = await new PgOptimizationRepository(database).save(
    tenantId,
    loaded,
  );

  assert.equal(revision, "2");
  assert.deepEqual(calls, [updateOptimization]);
});
