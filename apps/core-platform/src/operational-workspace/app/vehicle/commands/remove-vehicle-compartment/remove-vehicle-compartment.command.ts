import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class RemoveVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly compartmentId: string,
    readonly identity: Identity,
  ) {}
}
