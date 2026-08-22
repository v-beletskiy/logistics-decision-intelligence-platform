import type { VehicleDetailsInput } from "../../models/vehicle-details.input";

export class UpdateVehicleDetailsCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleDetailsInput,
  ) {}
}
