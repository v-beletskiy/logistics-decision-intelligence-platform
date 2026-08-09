# Operational Workspace - Assignment aggregate root

Represents the allocation of operational resources required to execute a Route.

## Invariants

- An Assignment references exactly one Route.
- An Assignment has exactly one Vehicle.
- An Assignment has exactly one Driver.
- A started Assignment cannot change its assigned Route, Vehicle, or Driver.
- A completed Assignment cannot be modified.
- Reassigning a created Assignment to its current Vehicle or Driver is an idempotent no-op.
- Only a created Assignment can be started.
- An Assignment is active while in the `Created` or `InProgress` state.
- A Vehicle, Driver, or Route participates in at most one active Assignment.

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
  - Created
  - InProgress
  - Completed
  - Cancelled

## Repository Interfaces

- AssignmentRepository
  - findById(id: AssignmentId)
  - existsActiveForRoute(routeId: RouteId)
  - existsRunningForRoute(routeId: RouteId)
  - existsActiveForVehicle(vehicleId: VehicleId)
  - existsActiveForDriver(driverId: DriverId)
  - save(assignment: Assignment)
  - delete(id: AssignmentId)

## References to other aggregates

- RouteId
- VehicleId
- DriverId

---
