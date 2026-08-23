# Shipment Aggregate

A transportation request throughout its lifecycle representing the movement of goods from an origin location to a destination location.

## Invariants

- A Shipment has exactly one Pickup.
- A Shipment has exactly one Delivery.
- A Shipment always has exactly one ShipmentStatus.
- A Shipment cannot be completed before both Pickup and Delivery are completed.
- Pickup must be completed before Delivery.
- A Cancelled Shipment cannot be executed.
- A Completed Shipment cannot be modified.

## Domain Events

- ShipmentCreatedDomainEvent
- ShipmentDetailsUpdatedDomainEvent
- ShipmentStartedDomainEvent
- ShipmentCompletedDomainEvent
- ShipmentCancelledDomainEvent
- PickupCompletedDomainEvent
- DeliveryCompletedDomainEvent
- RouteAssignedDomainEvent
- RouteUnassignedDomainEvent

## Value Objects

- **Address** (shared kernel VO) — pickup/delivery location details.
- **TimeWindow** (shared kernel VO) — the requested time interval during which a pickup or delivery should be performed.
- **ShipmentEndpoint** — represents either the pickup or delivery endpoint of a Shipment. Contains the operational address and time window.
  - Fields:
    - address: Address (shared kernel VO)
    - timeWindow: TimeWindow (shared kernel VO)
  - Invariants:
    - Address and TimeWindow must both be present.
- **Weight** (shared kernel VO) — shipment load.
- **Dimensions** (shared kernel VO) — shipment size (length/width/height).

## Enums

- ShipmentStatus
  - Created
  - Planned
  - InProgress
  - Completed
  - Cancelled

## Repository Interfaces

- ShipmentRepository
  - `findById`, `findByIds`
  - `add`, `save`

## References to other aggregates

- RouteId
- AssignmentId

---
