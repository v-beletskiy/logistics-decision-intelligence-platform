# Depot Use Cases

| Use case | Purpose |
| --- | --- |
| `CreateDepotCommand` | Create a Depot. |
| `UpdateDepotDetailsCommand` | Change Depot details. |
| `UpdateDepotDriverCapacityCommand` | Change supported Driver capacity. |
| `UpdateDepotVehicleCapacityCommand` | Change supported Vehicle capacity. |
| `ActivateDepotCommand` | Make an inactive Depot operational. |
| `InactivateDepotCommand` | Make a Depot temporarily inactive. |
| `CloseDepotCommand` | Permanently close a Depot. |

Handlers invoke Depot behavior and persist the Aggregate through
`DepotRepository`; lifecycle and capacity rules remain in the Domain.
