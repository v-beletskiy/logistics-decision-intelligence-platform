# AssignmentPlanningPolicy

## Purpose

Evaluates cross-aggregate eligibility for creating or changing an Assignment.
The policy consumes already-loaded domain objects and conflict facts supplied by
the application layer. It performs no persistence, infrastructure access, or
aggregate mutation.

Assignment remains the sole owner of resource-allocation state changes. After
the policy approves a candidate Vehicle or Driver, the application handler
invokes `Assignment.assignVehicle(...)` or `Assignment.assignDriver(...)`.

## Business Rules

- A Vehicle marked as Unavailable, Maintenance, or Decommissioned cannot be assigned.
- A Vehicle cannot participate in multiple active Assignments simultaneously.
- A Driver marked as Suspended cannot be assigned.
- A Driver cannot participate in multiple active Assignments simultaneously.
- The total Shipment load must not exceed the sum of the Vehicle Compartment capacities.
- Every Shipment dimension envelope must fit within at least one Vehicle Compartment.
- A Route cannot have more than one active Assignment simultaneously.
- A completed or cancelled Route cannot be assigned.

## Operations

- `assertCanCreateAssignment(...)` evaluates Route, Vehicle, Driver, load, and conflict rules.
- `assertVehicleCanBeAssigned(...)` evaluates Vehicle availability, conflicts, and load capacity for reassignment.
- `assertDriverCanBeAssigned(...)` evaluates Driver eligibility and conflicts for reassignment.

The `assert...` naming is intentional: successful evaluation returns no value;
a rejected business decision raises a Domain Exception.

## Inputs and ownership

- Shipment load uses validated `Weight` and `Dimensions` value objects rather than primitive property bags.
- Unit conversion and dimension-envelope comparison belong to the shared measurement value objects.
- The application layer supplies boolean conflict facts obtained through repository existence queries.
- The policy owns only cross-aggregate decisions; Assignment owns lifecycle and mutation invariants.

## Capacity-screening boundary

Capacity screening is linear for total weight and volume and then checks each
Shipment against the available Compartment dimension envelopes. It establishes
aggregate feasibility, but it is not a cargo-placement or bin-packing plan.
Compartment type compatibility and an explicit allocation of Shipments to
Compartments require additional cargo characteristics and belong in a future
loading-planning capability, not in this policy.

Dimension comparison is axis-aligned. Length, width, and height retain their
domain meaning; the policy does not infer that cargo may be rotated.

## Active Assignment and concurrency

An Assignment is active while it is in `CREATED` or `IN_PROGRESS`. Completed
and Cancelled Assignments do not reserve their Vehicle, Driver, or Route.

Repository conflict checks use `SELECT EXISTS` so eligibility checks do not
hydrate Assignment aggregates and their Shipment children. These reads provide
useful domain feedback but cannot by themselves prevent races. Partial unique
database indexes on active Assignment Vehicle, Driver, and Route references are
the authoritative concurrency backstop.
