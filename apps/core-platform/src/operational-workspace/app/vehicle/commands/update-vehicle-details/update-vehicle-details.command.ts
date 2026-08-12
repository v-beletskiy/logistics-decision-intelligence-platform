import type { VehicleDetails } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";

export class UpdateVehicleDetailsCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleDetails,
  ) {}
}
