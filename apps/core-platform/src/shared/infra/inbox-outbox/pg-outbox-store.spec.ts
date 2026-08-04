import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AppConfig } from "../config/app-config";
import type { PgDatabase } from "../persistence/pg-database";
import type { TransactionManager } from "../persistence/transaction-manager";
import { PgOutboxStore } from "./pg-outbox-store";

test("claims events with a lease token and uses it for state transitions - happy path scenario with the same token", async () => {
  const queries: Array<{
    readonly text: string;
    readonly values: readonly unknown[];
  }> = [];
  const database = {
    query: async (text: string, values: readonly unknown[] = []) => {
      queries.push({ text, values });
      if (text.includes("RETURNING outbox.event_id")) {
        return {
          rows: [
            {
              event_id: "7fd37f50-7510-41a4-a54c-51b1924530ed",
              event_type: "operational-workspace.route.created.v1",
              event_version: 1,
              occurred_at: new Date("2026-08-01T00:00:00.000Z"),
              tenant_id: "e75a6194-423a-4e59-94f1-0876fc583a0b",
              initiated_by_user_id: null,
              lock_token: "5ce7767c-b162-4b8a-8ce7-e7e9cf6bdc9f",
              payload: { routeId: "route-1" },
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
    immediateTransactionManager(),
  );

  const [claim] = await store.claimPendingBatch(10);
  const markedPublished = await store.markPublished(
    claim.event.eventId,
    claim.lockToken,
  );
  const rescheduled = await store.reschedule(
    claim.event.eventId,
    claim.lockToken,
    new Date("2026-08-01T00:01:00.000Z"),
    new Error("broker unavailable"),
  );

  assert.equal(claim.lockToken, "5ce7767c-b162-4b8a-8ce7-e7e9cf6bdc9f");
  assert.equal(markedPublished, true);
  assert.equal(rescheduled, true);
  assert.match(queries[0]?.text ?? "", /lock_token = gen_random_uuid\(\)/);
  assert.match(queries[0]?.text ?? "", /FOR UPDATE SKIP LOCKED/);
  assert.doesNotMatch(queries[0]?.text ?? "", /\n\s+OFFSET\s+\$/);
  assert.deepEqual(queries[0]?.values, [10, 300_000]);
  assert.match(queries[1]?.text ?? "", /lock_token = \$2/);
  assert.deepEqual(queries[1]?.values, [claim.event.eventId, claim.lockToken]);
  assert.match(queries[2]?.text ?? "", /lock_token = \$3/);
  assert.deepEqual(queries[2]?.values, [
    claim.event.eventId,
    new Date("2026-08-01T00:01:00.000Z"),
    claim.lockToken,
    "broker unavailable",
  ]);
});

function immediateTransactionManager(): TransactionManager {
  return {
    run: async <TResult>(operation: () => Promise<TResult>): Promise<TResult> =>
      operation(),
  } as TransactionManager;
}
