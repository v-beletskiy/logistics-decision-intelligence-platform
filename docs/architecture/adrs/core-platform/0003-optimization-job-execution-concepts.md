# ADR-0003 — Optimization Job Execution (Decision Intelligence context)

## Context

We consider this talking about Decision Intelligence context optimization workflows as an example. But the concepts apply to other contexts as well.

Optimization is a long-running process involving constraint solving and AI-assisted analysis. Dispatchers must continue working while optimization is running, and recommendations must always reflect the latest operational state.

## Decision

- Optimization is executed asynchronously as a background job.
- Version 1 optimizes `Route` only. It's being taken as an example going forward.
- Every `Optimization` stores the `RouteId` and its `inputVersion`.
- Only one optimization may be active per certain `RecommendationType` `Route` at a time.
- A dedicated `OptimizationTriggerPolicy` determines whether a Route change requires re-optimization. Policy is run on Route change events.
- When a Route change triggers re-optimization:
  - the currently running `Optimization` is marked as `Cancelled` and gets terminated from infrastructure perspective (e.g. BullMQ job) to prevent resource waste;
  - a new `Optimization` is created using the latest Route version.
- Optimization results are sent to the **AI Platform** for structured analysis.
- Decision Intelligence persists both optimization results and AI analysis.
- The UI never blocks - **Route can be modified in any way while optimization is running**. It displays optimization progress and automatically refreshes recommendations when ready.
- System-wide optimization concurrency is configured by the job execution infrastructure, not by the domain.

## Consequences

### Advantages

- Non-blocking user experience.
- Clear separation between deterministic optimization and AI analysis.
- Reduced wasted computation.

### Trade-offs

- Eventual consistency.
- Additional coordination of optimization lifecycle.

## Future Evolution

- Optimization for additional planning entities.
- Prioritized optimization queues.
- Customer-specific optimization policies.
