import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ChangeVehicleAvailabilityCommand {
  constructor(
    readonly vehicleId: string,
    readonly available: boolean,
    readonly identity: Identity,
  ) {}
}
