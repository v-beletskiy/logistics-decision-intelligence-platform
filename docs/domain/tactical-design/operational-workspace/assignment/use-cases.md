# Assignment Use Cases

| Use case | Purpose |
| --- | --- |
| `CreateAssignmentCommand` | Allocate a Vehicle and Driver to a Route. |
| `ReassignVehicleCommand` | Replace the assigned Vehicle. |
| `ReassignDriverCommand` | Replace the assigned Driver. |
| `StartAssignmentCommand` | Start Assignment execution. |
| `CompleteAssignmentCommand` | Complete Assignment execution. |
| `CancelAssignmentCommand` | Cancel an Assignment. |

## Create Assignment

1. Load the Route, Vehicle, Driver, and unique Shipments.
2. Check active-assignment conflicts.
3. Evaluate `AssignmentPlanningPolicy` using the loaded Domain objects.
4. Create and persist the Assignment with immutable shipment-load snapshots.

Reassignment follows the same policy boundary and is idempotent when the
resource is unchanged. Cancelling publishes `RouteInputChangedApplicationEvent`
because it changes Route planning input.
