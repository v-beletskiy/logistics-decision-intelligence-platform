# Operational Workspace - Assignment aggregate root

Represents the allocation of operational resources required to execute a Route.

## Invariants

- An Assignment references exactly one Route.
- An Assignment has exactly one Vehicle.
- An Assignment has exactly one Driver.
- A started Assignment cannot change its assigned Route, Vehicle, or Driver.
- A completed Assignment cannot be modified.
- A cancelled Assignment cannot be started.

## Commands

- CreateAssignmentCommand
- ReassignVehicleCommand
- ReassignDriverCommand
- StartAssignmentCommand
- CompleteAssignmentCommand
- CancelAssignmentCommand

## Domain Events

- AssignmentCreatedDomainEvent
- VehicleReassignedDomainEvent
- DriverReassignedDomainEvent
- AssignmentStartedDomainEvent
- AssignmentCompletedDomainEvent
- AssignmentCancelledDomainEvent

## Enums

- AssignmentStatus
  - Planned
  - InProgress
  - Completed
  - Cancelled

## Repository Interfaces

- AssignmentRepository
  - findById(id: AssignmentId)
  - findRunningByRouteId(routeId: RouteId)
  - findActiveByVehicleId(vehicleId: VehicleId)
  - findActiveByDriverId(driverId: DriverId)
  - save(assignment: Assignment)
  - delete(id: AssignmentId)

## References to other aggregates

- RouteId
- VehicleId
- DriverId

---
