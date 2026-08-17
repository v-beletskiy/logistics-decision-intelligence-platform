# Operational Workspace - Driver aggregate root

A transportation operator responsible for executing Assignments using a Vehicle.

## Invariants

- A Driver always has exactly one DriverStatus.
- Names, license number, phone number, and certification fields are non-blank.
- A Driver owns at most ten Certifications.
- Certification identifiers and `(type, credential number)` pairs are unique within a Driver.
- Availability cannot change while a Driver is suspended.

## Commands

- RegisterDriverCommand
- UpdateDriverDetailsCommand
- ChangeDriverAvailabilityCommand
- SuspendDriverCommand
- ReinstateDriverCommand
- AddDriverCertificationCommand
- UpdateDriverCertificationCommand
- RemoveDriverCertificationCommand

## Domain Events

- DriverRegisteredDomainEvent
- DriverDetailsUpdatedDomainEvent
- DriverMarkedAvailableDomainEvent
- DriverMarkedUnavailableDomainEvent
- DriverSuspendedDomainEvent
- DriverReinstatedDomainEvent
- DriverCertificationAddedDomainEvent
- DriverCertificationUpdatedDomainEvent
- DriverCertificationRemovedDomainEvent

## Enums

- DriverStatus
  - Available
  - Unavailable
  - Suspended

## Repository Interfaces

- DriverRepository
  - findById(tenantId, id)
  - findByIdForUpdate(tenantId, id)
  - add(tenantId, driver)
  - save(tenantId, loadedDriver)

## References to other aggregates

- DepotId

---
