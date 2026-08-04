import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class DecommissionVehicleCommand {
  constructor(
    readonly vehicleId: string,
    readonly identity: Identity,
  ) {}
}
