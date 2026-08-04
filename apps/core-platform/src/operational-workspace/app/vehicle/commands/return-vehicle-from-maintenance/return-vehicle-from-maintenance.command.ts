import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ReturnVehicleFromMaintenanceCommand {
  constructor(
    readonly vehicleId: string,
    readonly identity: Identity,
  ) {}
}
