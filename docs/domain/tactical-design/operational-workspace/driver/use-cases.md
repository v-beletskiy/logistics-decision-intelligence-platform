# Driver Use Cases

| Use case | Purpose |
| --- | --- |
| `RegisterDriverCommand` | Register a Driver. |
| `UpdateDriverDetailsCommand` | Change Driver details. |
| `ChangeDriverAvailabilityCommand` | Change operational availability. |
| `SuspendDriverCommand` | Suspend a Driver. |
| `ReinstateDriverCommand` | Reinstate a suspended Driver. |
| `AddDriverCertificationCommand` | Add a certification. |
| `UpdateDriverCertificationCommand` | Change a certification. |
| `RemoveDriverCertificationCommand` | Remove a certification. |
| `SearchDriversQuery` | Search the Driver read projection with page or cursor pagination. |

Commands persist the complete bounded Driver aggregate. `SearchDriversQuery`
uses the dedicated read store and does not load Aggregates.
