import type { VehicleCompartmentInput } from "../../vehicle.inputs";

export class AddVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleCompartmentInput,
  ) {}
}
