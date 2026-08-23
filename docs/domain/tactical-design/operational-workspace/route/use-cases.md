# Route Use Cases

| Use case | Purpose |
| --- | --- |
| `CreateRouteCommand` | Create a Route and its ordered RouteStops for existing Shipments. |
| `StartRouteCommand` | Start execution when a running Assignment exists. |
| `CompleteRouteCommand` | Complete a Route after its required stops. |
| `CancelRouteCommand` | Cancel a Route allowed by its lifecycle. |
| `StartRouteStopCommand` | Mark the next permitted stop as active. |
| `RecordRouteStopArrivalCommand` | Record arrival at the active stop. |
| `RecordRouteStopDepartureCommand` | Complete the active stop and advance Route progression. |
| `GetRouteAnalysisContextQuery` | Return the read projection required for recommendation analysis. |

## Create Route

1. Load the referenced Shipments.
2. Validate the proposed structure through the Route planning policy.
3. Create the Route and RouteStop aggregates.
4. Persist them in one transaction.
5. Publish Domain Events and `RouteInputChangedApplicationEvent` after
   successful persistence.

## Execute Route Stop

The handler locks the Route and addressed RouteStop in a stable order. Arrival
and departure update both aggregates in one transaction so Route progression
and stop state cannot diverge.

## Public Planning Snapshot

Operational Workspace implements its public `RoutePlanningSnapshotQuery` by
mapping the internal Route read model to `routeVersion` and `orderedStops`. The
contract does not contain optimization-specific concepts.
