# AssignmentPlanningService

## Purpose

Coordinates resource allocation required to execute a Route.

## Business Rules

- A Vehicle marked as Unavailable, Maintenance, or Decommissioned cannot be assigned.
- A Vehicle cannot participate in multiple active Assignments simultaneously.
- A Driver marked as Suspended cannot be assigned.
- A Driver cannot participate in multiple active Assignments simultaneously.
- The total Shipment load assigned to an Assignment must not exceed the assigned Vehicle Capacity.
- The total Shipment dimensions assigned to an Assignment must fit within the assigned Vehicle Capacity.
- A Route cannot have more than one active Assignment simultaneously.

## Operations

- PlanAssignment

## Collaborating Aggregates

- Assignment
- Vehicle
- Driver
- Route
- Shipment

---
