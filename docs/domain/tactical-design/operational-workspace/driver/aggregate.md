# Operational Workspace - Driver aggregate root

A transportation operator responsible for executing Assignments using a Vehicle.

## Invariants

- A Driver always has exactly one DriverStatus.

## Commands

- RegisterDriverCommand
- UpdateDriverDetailsCommand
- MarkDriverAvailableCommand
- MarkDriverUnavailableCommand
- SuspendDriverCommand
- ReinstateDriverCommand

## Domain Events

- DriverRegisteredDomainEvent
- DriverDetailsUpdatedDomainEvent
- DriverMarkedAvailableDomainEvent
- DriverMarkedUnavailableDomainEvent
- DriverSuspendedDomainEvent
- DriverReinstatedDomainEvent

## Enums

- DriverStatus
  - Available
  - Unavailable
  - Suspended

## Repository Interfaces

- DriverRepository
  - findById(id: DriverId)
  - findAvailable()
  - save(driver: Driver)
  - delete(id: DriverId)

## References to other aggregates

- DepotId

---
