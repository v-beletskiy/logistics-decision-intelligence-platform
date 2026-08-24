import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ServiceUnavailableException } from "@nestjs/common";

import { HealthController, HealthResponse } from "./health.controller.js";
import type { PgDatabase } from "../persistence/pg-database.js";

test("reports readiness after PostgreSQL accepts a query", async () => {
  const controller = new HealthController({
    query: async () => ({ rows: [], rowCount: 1 }),
  } as unknown as PgDatabase);

  assert.deepEqual(await controller.ready(), {
    status: "ready",
  } as HealthResponse);
});

test("reports service unavailable when PostgreSQL cannot accept a query", async () => {
  const controller = new HealthController({
    query: async () => {
      throw new Error("connection refused");
    },
  } as unknown as PgDatabase);

  await assert.rejects(
    controller.ready(),
    (error: unknown) => error instanceof ServiceUnavailableException,
  );
});
