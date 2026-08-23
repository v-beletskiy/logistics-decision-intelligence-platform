# Shipment Use Cases

| Use case | Purpose |
| --- | --- |
| `CreateShipmentCommand` | Create a transportation request with pickup and delivery endpoints. |
| `UpdateShipmentDetailsCommand` | Change mutable shipment details before execution. |
| `CancelShipmentCommand` | Cancel a shipment that will no longer execute. |
| `CompletePickupCommand` | Record completion of pickup. |
| `CompleteDeliveryCommand` | Record completion of delivery after pickup. |

Each command loads or creates the Shipment, invokes Aggregate behavior, and
persists it through `ShipmentRepository` in the shared command-handler
transaction boundary.
