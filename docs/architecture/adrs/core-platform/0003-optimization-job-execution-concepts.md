# ADR-0003 — Optimization Job Execution

## Context

Route optimization is asynchronous and may overlap with operational changes.
Recommendations must reflect a known Route input version, while at most one
Optimization may be active for a Route.

## Decision

### Trigger and Queueing

Operational Workspace publishes the typed `RouteInputChangedApplicationEvent`.
Decision Intelligence handles it through:

```text
RouteInputChangedHandler
        │
        ▼
QueueOptimizationCommand
        │
        ▼
QueueOptimizationHandler
```

The event handler only creates trusted execution context and delegates the use
case. The command handler loads the latest Route input, applies
`OptimizationTriggerPolicy`, cancels any active Optimization, queues the new
one with its `inputVersion`, and publishes `optimizationJobEnqueuedV1` through
the transactional outbox.

### Route Input Boundary

Operational Workspace exposes the provider-neutral
`RoutePlanningSnapshotQuery`, returning `orderedStops`. A Decision Intelligence
consumer-owned query adapter implements its local `RouteOptimizationInputQuery`,
requires a non-empty stop list, and extracts the first stop as `fixedOrigin`.
Optimization terminology does not leak into the provider's public contract.

### Active Optimization Consistency

`OptimizationRepository.findActiveByRouteIdForUpdate` provides exclusive
transactional coordination for changing the active Optimization:

1. the PostgreSQL adapter acquires a transaction-scoped advisory lock keyed by
   tenant and Route;
2. it selects the active Optimization with `FOR UPDATE`;
3. the handler performs one read-decide-cancel-add sequence;
4. a tenant-scoped partial unique index remains the final guarantee that only
   one `QUEUED` or `RUNNING` Optimization exists per Route.

The advisory lock covers the case where no active row exists. `SKIP LOCKED`
must not be used because hiding an active row would make the replacement
decision incorrect.

### Execution

`optimizationJobEnqueuedV1` is consumed by
`OptimizationExecutionConsumer`. The consumer delegates to
`ExecuteOptimizationHandler`, which validates the current input version,
executes the optimizer, persists the completed Optimization and generated
Recommendations, and publishes one `recommendationAnalysisRequestedV1` per
Recommendation.

The recommendation-analysis events are created by the Decision Intelligence
Application event factory and published. The complete batch
is validated before one atomic outbox insert in the same business transaction.
No intermediate internal application event is used because there is no separate
in-process consumer.

External OSRM and VROOM responses are schema-validated and then checked for
request-specific semantic consistency before entering Application or Domain
code.

## Consequences

- Dispatchers can continue changing Routes while optimization runs.
- Version checks prevent stale results from becoming recommendations.
- Route-scoped coordination prevents active-optimization races.
- Execution and AI analysis remain eventually consistent and idempotent.
