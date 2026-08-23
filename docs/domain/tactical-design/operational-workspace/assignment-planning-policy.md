# Assignment Planning Policy

`AssignmentPlanningPolicy` evaluates cross-Aggregate eligibility for creating or
changing an Assignment. Application handlers load the required Route, Vehicle,
Driver, Shipment load, and conflict facts before invoking it.

The policy enforces:

- Vehicle and Driver availability;
- one active Assignment per Vehicle, Driver, and Route;
- Route lifecycle eligibility;
- aggregate Shipment weight, volume, and dimension-envelope fit.

It performs no persistence or mutation. After approval, the Assignment
Aggregate owns creation or reassignment. Repository conflict queries provide
useful feedback; tenant-scoped partial unique indexes remain the concurrency
backstop.

Capacity screening establishes feasibility only. It is not a cargo-placement
or bin-packing plan.
