# Background Processing — TypeScript

TypeScript primitives for implementing bounded, observable, and gracefully
stoppable background workers.

The package currently provides batch-draining orchestration.

The package owns framework-independent orchestration. Applications retain
ownership of:

- data-source pagination or claiming;
- transactions and locking;
- retry and failure policies;
- transport-specific processing;
- framework lifecycle integration.

## Batch processing

`drainBatches` stops when the source returns an empty or partial batch. It also
enforces a maximum number of batches per drain so continuously arriving work
cannot keep one invocation alive indefinitely.
