import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class UpdateDepotVehicleCapacityCommand {
  constructor(
    readonly depotId: string,
    readonly vehicleCapacity: number,
    readonly identity: Identity,
  ) {}
}
