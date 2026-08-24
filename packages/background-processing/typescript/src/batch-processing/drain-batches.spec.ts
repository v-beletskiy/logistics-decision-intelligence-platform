import * as assert from "node:assert/strict";
import { test } from "node:test";

import { drainBatches } from "./drain-batches.js";

test("drains full batches until the source returns a partial batch", async () => {
  const pages = [[1, 2], [3]];
  const processed: number[][] = [];

  const result = await drainBatches({
    batchSize: 2,
    maxBatches: 10,
    loadBatch: async () => pages.shift() ?? [],
    processBatch: async (items) => {
      processed.push([...items]);
    },
  });

  assert.deepEqual(processed, [[1, 2], [3]]);
  assert.deepEqual(result, {
    batchesProcessed: 2,
    itemsProcessed: 3,
    reachedBatchLimit: false,
  });
});

test("stops at the batch limit and reports that more work may remain", async () => {
  let loads = 0;

  const result = await drainBatches({
    batchSize: 2,
    maxBatches: 2,
    loadBatch: async () => {
      loads += 1;
      return [loads * 2 - 1, loads * 2];
    },
    processBatch: async () => undefined,
  });

  assert.equal(loads, 2);
  assert.deepEqual(result, {
    batchesProcessed: 2,
    itemsProcessed: 4,
    reachedBatchLimit: true,
  });
});

test("rejects a source that violates the requested batch size", async () => {
  await assert.rejects(
    drainBatches({
      batchSize: 2,
      maxBatches: 1,
      loadBatch: async () => [1, 2, 3],
      processBatch: async () => undefined,
    }),
    /returned 3 items for a limit of 2/,
  );
});
