import type { RegisterVehicleDetails } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";

export class RegisterVehicleCommand {
  constructor(
    readonly details: RegisterVehicleDetails,
  ) {}
}
