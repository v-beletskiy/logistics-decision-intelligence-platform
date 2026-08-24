import type { VehicleDetailsInput } from "../../models/vehicle-details.input.js";

export class UpdateVehicleDetailsCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleDetailsInput,
  ) {}
}
