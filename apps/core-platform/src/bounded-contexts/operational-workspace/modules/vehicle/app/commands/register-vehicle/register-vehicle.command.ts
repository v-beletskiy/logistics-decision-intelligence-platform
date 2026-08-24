import type { RegisterVehicleInput } from "../../models/register-vehicle.input.js";

export class RegisterVehicleCommand {
  constructor(readonly details: RegisterVehicleInput) {}
}
