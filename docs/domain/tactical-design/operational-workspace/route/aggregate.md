# Operational Workspace - Route aggregate root

An operational transportation plan defining lifecycle and ordered progression for independently executable RouteStops.

## Invariants

- Route progression is strictly sequential and has at most one active RouteStop.
- A Route completes only after all RouteStops complete.
- Planning requires one Pickup and Delivery RouteStop per Shipment, with Pickup preceding Delivery.

## Commands

- CreateRouteCommand
- ReorderRouteStopsCommand
- StartRouteCommand
- StartRouteStopCommand
- RecordRouteStopArrivalCommand
- RecordRouteStopDepartureCommand
- CompleteRouteCommand
- CancelRouteCommand

## Domain Events

- RouteCreatedDomainEvent
- RouteStopsReorderedDomainEvent
- RouteStartedDomainEvent
- RouteCompletedDomainEvent
- RouteCancelledDomainEvent
- RouteStopArrivedDomainEvent
- RouteStopDepartedDomainEvent

## Aggregate Roots

- **Route** — owns lifecycle, `plannedStopCount`, `nextPermittedStopSequence`, and `activeStopSequence?`.

- **RouteStop** - represents the planned execution of either a Pickup or Delivery operation for a Shipment within a Route.
  - Fields:
    - routeId: RouteId
    - shipmentId: ShipmentId
    - sequence
    - operationType: RouteStopOperationType (enum)
    - status: RouteStopStatus (enum)
    - planned arrival/departure
    - actual arrival/departure
  - Invariants:
    - Arrival transitions Planned to InProgress.
    - Departure transitions InProgress to Completed and cannot precede arrival.
    - A cancelled RouteStop cannot be executed.

## Value Objects

- **Distance** (shared kernel VO) — planned, estimated, and actual travel distance for a Route.
- **Duration** (shared kernel VO) — planned, estimated, and actual execution duration for a Route.

## Enums

- RouteStatus
  - Draft
  - Planned
  - InProgress
  - Completed
  - Cancelled

- RouteStopStatus
  - Planned
  - InProgress
  - Completed
  - Cancelled

- RouteStopOperationType
  - Pickup
  - Delivery

## Repository Interfaces

- RouteRepository
  - findById(tenantId, id)
  - findByIdForUpdate(tenantId, id)
  - add(tenantId, route)
  - save(tenantId, loadedRoute)

- RouteStopRepository
  - findAllByRouteId(tenantId, routeId)
  - findByRouteAndSequence(tenantId, routeId, sequence)
  - findByRouteAndSequenceForUpdate(tenantId, routeId, sequence)
  - addMany(tenantId, stops)
  - save(tenantId, loadedRouteStop)

## References to other aggregates

- RouteStop references RouteId and ShipmentId by identity.

---
