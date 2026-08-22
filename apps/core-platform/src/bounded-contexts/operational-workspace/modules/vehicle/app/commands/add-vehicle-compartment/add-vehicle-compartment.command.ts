import type { VehicleCompartmentInput } from "../../models/vehicle-compartment.input";

export class AddVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: VehicleCompartmentInput,
  ) {}
}
