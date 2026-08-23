# Vehicle Aggregate

A transportation asset used to execute Assignments.

## Invariants

- A Vehicle always has exactly one VehicleStatus.
- A Vehicle must always retain at least one Compartment.

## Domain Events

- VehicleRegisteredDomainEvent
- VehicleDetailsUpdatedDomainEvent
- VehicleCompartmentAddedDomainEvent
- VehicleCompartmentUpdatedDomainEvent
- VehicleCompartmentRemovedDomainEvent
- VehicleMarkedAvailableDomainEvent
- VehicleMarkedUnavailableDomainEvent
- VehicleSentToMaintenanceDomainEvent
- VehicleReturnedFromMaintenanceDomainEvent
- VehicleDecommissionedDomainEvent

## Entities

- **Compartment** – represents an independently managed cargo area within a Vehicle, having its own loading constraints and characteristics.
  - Fields:
    - type: CompartmentType (enum)
    - capacity: Capacity (VO)
    - name?: string
  - Invariants:
    - Compartment type must be specified.
    - A compartment must have a valid capacity.

## Value Objects

- **Capacity** — the maximum carrying capability of the Vehicle.
  - Fields:
    - maxWeight: Weight (shared kernel VO)
    - maxItemDimensions: Dimensions (shared kernel VO) - largest single cargo item that can physically fit.
    - maxVolume: Volume (shared kernel VO)
  - Invariants:
    - maxWeight, maxItemDimensions, and maxVolume must all be specified.
- **Dimensions** (shared kernel VO) — physical dimensions of the cargo compartment(s).
- **Volume** (shared kernel VO) — total volume capacity of the Vehicle.

## Enums

- VehicleStatus
  - Available
  - Unavailable
  - Maintenance
  - Decommissioned

- CompartmentType
  - DryCargo
  - Refrigerated
  - Frozen
  - Hazardous

## Repository Interfaces

- VehicleRepository
  - `findById`, `findAvailable`
  - `add`, `save`

## References to other aggregates

- DepotId

---
