import * as assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { integrationEventId } from "@logistics-decision-intelligence/integration-events";

import type { AppConfig } from "../../../../config/app-config";
import type { PgDatabase } from "../../../../persistence/pg-database";
import type { TrxManager } from "../../../../../app/trx/trx-manager";
import { PgOutboxStore } from "./pg-outbox-store";

test("claims events with a lease token and uses it for state transitions - happy path scenario with the same token", async () => {
  const queries: Array<{
    readonly text: string;
    readonly values: readonly unknown[];
  }> = [];
  const database = {
    query: async (text: string, values: readonly unknown[] = []) => {
      queries.push({ text, values });
      if (text.includes("RETURNING outbox.lock_token")) {
        return {
          rows: [
            {
              lock_token: "5ce7767c-b162-4b8a-8ce7-e7e9cf6bdc9f",
              event: {
                specversion: "1.0",
                id: "7fd37f50-7510-41a4-a54c-51b1924530ed",
                source:
                  "urn:logistics-decision-intelligence:decision-intelligence",
                type: "decision-intelligence.recommendation-analysis-requested.v1",
                subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
                time: "2026-08-01T00:00:00.000Z",
                dataschema:
                  "urn:logistics-decision-intelligence:core-platform:decision-intelligence:recommendation-analysis-requested:v1",
                tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
                data: {
                  recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
                  routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
                },
              },
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 1 };
    },
  } as unknown as PgDatabase;
  const store = new PgOutboxStore(
    { messaging: { outboxProcessingLeaseMs: 300_000 } } as AppConfig,
    database,
    immediateTrxManager(),
  );

  const [claim] = await store.claimPendingBatch(10);
  const markedPublished = await store.markPublished(
    claim.event.id,
    claim.lockToken,
  );
  const rescheduled = await store.reschedule(
    claim.event.id,
    claim.lockToken,
    new Date("2026-08-01T00:01:00.000Z"),
    new Error("broker unavailable"),
  );
  await store.enqueueMany([
    claim.event,
    { ...claim.event, id: integrationEventId(randomUUID()) },
  ]);

  assert.equal(claim.lockToken, "5ce7767c-b162-4b8a-8ce7-e7e9cf6bdc9f");
  assert.equal(markedPublished, true);
  assert.equal(rescheduled, true);
  assert.match(queries[0]?.text ?? "", /lock_token = gen_random_uuid\(\)/);
  assert.match(queries[0]?.text ?? "", /FOR UPDATE SKIP LOCKED/);
  assert.doesNotMatch(queries[0]?.text ?? "", /\n\s+OFFSET\s+\$/);
  assert.deepEqual(queries[0]?.values, [10, 300_000]);
  assert.match(queries[1]?.text ?? "", /lock_token = \$2/);
  assert.deepEqual(queries[1]?.values, [claim.event.id, claim.lockToken]);
  assert.match(queries[2]?.text ?? "", /lock_token = \$3/);
  assert.deepEqual(queries[2]?.values, [
    claim.event.id,
    new Date("2026-08-01T00:01:00.000Z"),
    claim.lockToken,
    "broker unavailable",
  ]);
  assert.match(queries[3]?.text ?? "", /jsonb_array_elements\(\$1::jsonb\)/);
  assert.equal(queries[3]?.values.length, 1);
  const batch = JSON.parse(String(queries[3]?.values[0])) as unknown[];
  assert.equal(batch.length, 2);
});

function immediateTrxManager(): TrxManager {
  return {
    run: async <TResult>(operation: () => Promise<TResult>): Promise<TResult> =>
      operation(),
  } as TrxManager;
}
