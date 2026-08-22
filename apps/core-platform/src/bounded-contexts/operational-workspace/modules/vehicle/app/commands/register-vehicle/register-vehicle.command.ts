import type { RegisterVehicleInput } from "../../models/register-vehicle.input";

export class RegisterVehicleCommand {
  constructor(readonly details: RegisterVehicleInput) {}
}
