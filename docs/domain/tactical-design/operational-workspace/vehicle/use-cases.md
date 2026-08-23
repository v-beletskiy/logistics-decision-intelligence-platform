# Vehicle Use Cases

| Use case | Purpose |
| --- | --- |
| `RegisterVehicleCommand` | Register a Vehicle and its compartments. |
| `UpdateVehicleDetailsCommand` | Change Vehicle details. |
| `ChangeVehicleAvailabilityCommand` | Change operational availability. |
| `SendVehicleToMaintenanceCommand` | Enter maintenance. |
| `ReturnVehicleFromMaintenanceCommand` | Return from maintenance. |
| `DecommissionVehicleCommand` | Permanently decommission a Vehicle. |
| `AddVehicleCompartmentCommand` | Add a capacity compartment. |
| `UpdateVehicleCompartmentCommand` | Change a compartment. |
| `RemoveVehicleCompartmentCommand` | Remove a compartment. |

Handlers invoke Vehicle behavior and persist the complete bounded Aggregate.
Capacity, lifecycle, and compartment invariants remain in the Domain.
