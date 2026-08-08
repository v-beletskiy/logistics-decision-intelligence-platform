# AssignmentPlanningPolicy

## Purpose

Enforces resource-allocation rules across Assignment, Vehicle, Driver, and
Route, and performs the mutations that depend on external resource
availability so they cannot be bypassed by direct aggregate calls.

## Business Rules

- A Vehicle marked as Unavailable, Maintenance, or Decommissioned cannot be assigned.
- A Vehicle cannot participate in multiple active Assignments simultaneously.
- A Driver marked as Suspended cannot be assigned.
- A Driver cannot participate in multiple active Assignments simultaneously.
- The total Shipment load assigned to an Assignment must not exceed the assigned Vehicle Capacity.
- A Shipment must fit within at least one Vehicle Compartment dimension envelope.
- A Route cannot have more than one active Assignment simultaneously.
- A completed or cancelled Route cannot be assigned.

## Operations

- PlanAssignment
- ReassignVehicle
- ReassignDriver

## Collaborating Aggregates

- Assignment
- Vehicle
- Driver
- Route
- Shipment

---

## Active Assignment

An Assignment is considered active while it is in the `CREATED` or
`IN_PROGRESS` state. Completed and Cancelled Assignments are inactive and do
not reserve their Vehicle, Driver, or Route.

Uniqueness of active Assignments per Vehicle, Driver, and Route is additionally
enforced by partial unique database indexes on the `assignments` table.

---
