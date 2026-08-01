# Decision Intelligence - Optimization aggregate root

Represents the execution of an optimization process (Route-related optimizations only in Version 1).

## Invariants

- An Optimization references exactly one Route.
- An Optimization stores exactly one input Route version.
- Only one Optimization may be active for a Route at a time. (enforced by domain service)
- A Completed, Cancelled, or Failed Optimization cannot transition back to Running.
- Recommendations can only be published by a Completed Optimization.

## Commands

- QueueOptimizationCommand
- StartOptimizationCommand
- CompleteOptimizationCommand
- CancelOptimizationCommand
- FailOptimizationCommand

## Domain Events

- OptimizationQueuedDomainEvent
- OptimizationStartedDomainEvent
- OptimizationCompletedDomainEvent
- OptimizationCancelledDomainEvent
- OptimizationFailedDomainEvent

## Enums

- OptimizationStatus
  - Queued
  - Running
  - Completed
  - Cancelled
  - Failed

An Optimization is active when its status is Queued or Running.

## Repository Interfaces

- OptimizationRepository
  - findById(id: OptimizationId)
  - findActiveByRouteId(routeId: RouteId)
  - save(optimization: Optimization)
  - update(optimization: Optimization)
  - delete(id: OptimizationId)

## References to other aggregates

- RouteId

---
