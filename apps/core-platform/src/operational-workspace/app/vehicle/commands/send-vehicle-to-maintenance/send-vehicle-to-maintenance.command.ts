import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class SendVehicleToMaintenanceCommand {
  constructor(
    readonly vehicleId: string,
    readonly identity: Identity,
  ) {}
}
