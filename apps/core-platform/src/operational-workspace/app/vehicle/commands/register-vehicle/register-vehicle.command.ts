import type { RegisterVehicleInput } from "../../vehicle.inputs";

export class RegisterVehicleCommand {
  constructor(
    readonly details: RegisterVehicleInput,
  ) {}
}
