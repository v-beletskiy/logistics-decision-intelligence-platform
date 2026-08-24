import type { VehicleCompartmentInput } from "../../models/vehicle-compartment.input.js";

export class AddVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleCompartmentInput,
  ) {}
}
