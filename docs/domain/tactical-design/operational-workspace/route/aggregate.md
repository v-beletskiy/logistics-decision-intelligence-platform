# Operational Workspace - Route aggregate root

An operational transportation plan defining the ordered execution of one or more Shipments.

## Invariants

- A Route contains at least one Pickup and one Delivery RouteStop.
- RouteStops have a unique execution sequence within the Route.
- For each Shipment assigned to the Route, Pickup must precede Delivery.
- Every Shipment assigned to the Route must have both Pickup and Delivery RouteStops.

## Commands

- CreateRouteCommand
- ReorderRouteStopsCommand
- StartRouteCommand
- CompleteRouteCommand
- CancelRouteCommand

## Domain Events

- RouteCreatedDomainEvent
- RouteStopsReorderedDomainEvent
- RouteStartedDomainEvent
- RouteCompletedDomainEvent
- RouteCancelledDomainEvent

## Entities

- **RouteStop** - represents the planned execution of either a Pickup or Delivery operation for a Shipment within a Route.
  - Fields:
    - shipmentId: ShipmentId
    - operationType: RouteStopOperationType (enum)
    - status: RouteStopStatus (enum)
    - schedule: Schedule (shared kernel VO)
  - Invariants:
    - A completed RouteStop cannot be modified or executed again.
    - A cancelled RouteStop cannot be executed.

## Value Objects

- **Schedule** (shared kernel VO) — represents one arrival/departure schedule. May be used as the planned, estimated or actual schedule for a RouteStop and Route.
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
  - findById(id: RouteId)
  - findByShipmentId(shipmentId: ShipmentId)
  - save(route: Route)
  - delete(id: RouteId)

## References to other aggregates

- ShipmentIds

---
