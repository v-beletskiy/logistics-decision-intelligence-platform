# Optimization Aggregate

An Optimization records one attempt to optimize a Route at a specific input
version.

## Invariants

- It references exactly one Route and positive input version.
- Status is one of `Queued`, `Running`, `Completed`, `Cancelled`, or `Failed`.
- Only a queued Optimization may start.
- Only a running Optimization may complete.
- Terminal Optimizations cannot return to an active state.

At most one Optimization may be active (`Queued` or `Running`) per tenant and
Route. The Application coordinates the change; the repository and partial
unique database index enforce consistency.

## Domain Events

- `OptimizationQueuedDomainEvent`
- `OptimizationStartedDomainEvent`
- `OptimizationCompletedDomainEvent`
- `OptimizationCancelledDomainEvent`
- `OptimizationFailedDomainEvent`

## Repository

`OptimizationRepository` exposes `findById`,
`findActiveByRouteIdForUpdate`, `add`, `save`, and `delete`. Loaded Aggregates
carry their expected revision for optimistic concurrency.
