import type { VehicleCompartmentInput } from "../../vehicle.inputs";

export class UpdateVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly compartmentId: string,
    readonly details: VehicleCompartmentInput,
  ) {}
}
