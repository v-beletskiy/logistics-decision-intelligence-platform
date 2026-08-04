export interface DrainBatchesOptions<TItem> {
  readonly batchSize: number;
  readonly maxBatches: number;
  readonly loadBatch: (limit: number) => Promise<readonly TItem[]>;
  readonly processBatch: (items: readonly TItem[]) => Promise<void>;
}

export interface DrainBatchesResult {
  readonly batchesProcessed: number;
  readonly itemsProcessed: number;
  /**
   * The final allowed batch was full, so more work may remain. The caller can
   * schedule another drain immediately without making this invocation unbounded.
   */
  readonly reachedBatchLimit: boolean;
}

export async function drainBatches<TItem>(
  options: DrainBatchesOptions<TItem>,
): Promise<DrainBatchesResult> {
  assertPositiveInteger("batchSize", options.batchSize);
  assertPositiveInteger("maxBatches", options.maxBatches);

  let batchesProcessed = 0;
  let itemsProcessed = 0;

  while (batchesProcessed < options.maxBatches) {
    const items = await options.loadBatch(options.batchSize);
    if (items.length > options.batchSize) {
      throw new Error(
        `loadBatch returned ${items.length} items for a limit of ${options.batchSize}.`,
      );
    }
    if (items.length === 0) {
      return { batchesProcessed, itemsProcessed, reachedBatchLimit: false };
    }

    await options.processBatch(items);
    batchesProcessed += 1;
    itemsProcessed += items.length;

    if (items.length < options.batchSize) {
      return { batchesProcessed, itemsProcessed, reachedBatchLimit: false };
    }
  }

  return { batchesProcessed, itemsProcessed, reachedBatchLimit: true };
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}
