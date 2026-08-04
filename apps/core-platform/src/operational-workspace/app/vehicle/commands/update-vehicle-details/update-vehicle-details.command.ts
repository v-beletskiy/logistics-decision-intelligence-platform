import type { VehicleDetails } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class UpdateVehicleDetailsCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleDetails,
    readonly identity: Identity,
  ) {}
}
