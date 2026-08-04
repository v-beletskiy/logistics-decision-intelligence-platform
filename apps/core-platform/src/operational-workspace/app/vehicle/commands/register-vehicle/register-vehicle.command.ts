import type { RegisterVehicleDetails } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class RegisterVehicleCommand {
  constructor(
    readonly details: RegisterVehicleDetails,
    readonly identity: Identity,
  ) {}
}
