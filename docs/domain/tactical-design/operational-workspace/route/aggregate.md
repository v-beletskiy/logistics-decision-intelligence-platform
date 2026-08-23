# Route and RouteStop Aggregates

`Route` owns transportation-plan lifecycle and sequential progression.
`RouteStop` is an independently persisted Aggregate for one pickup or delivery
operation.

## Invariants

- Route progression is sequential and has at most one active stop.
- A Route completes only after every planned stop completes.
- RouteStop arrival changes `Planned` to `InProgress`.
- RouteStop departure requires arrival and completes the stop.
- A cancelled Route or RouteStop cannot execute.

Cross-stop creation rules are owned by `RoutePlanningPolicy`.

## Domain Events

Route publishes created, started, completed, and cancelled events. RouteStop
publishes its own lifecycle events.

## Repositories

`RouteRepository` supports `findById`, `findByIdForUpdate`, `add`, and `save`.
`RouteStopRepository` supports identity and route-sequence lookup, ordered Route
lookup, pessimistic route-sequence lookup, `addMany`, and `save`.

Route and RouteStop are locked in a stable order during stop execution and use
expected revisions for optimistic writes.
