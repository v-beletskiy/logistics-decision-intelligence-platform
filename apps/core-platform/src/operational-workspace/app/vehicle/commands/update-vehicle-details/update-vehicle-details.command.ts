import type { VehicleDetailsInput } from "../../vehicle.inputs";

export class UpdateVehicleDetailsCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleDetailsInput,
  ) {}
}
