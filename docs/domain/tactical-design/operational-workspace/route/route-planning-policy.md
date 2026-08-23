# Route Planning Policy

`RoutePlanningPolicy.assertCanCreate(...)` validates a proposed ordered stop
plan before Aggregate creation:

- the plan contains at least one pickup and one delivery;
- each Shipment has exactly one pickup and one delivery;
- pickup precedes delivery for each Shipment.

The policy receives validated `RouteStopPlan` values, performs no persistence,
and does not create or mutate Domain state.
