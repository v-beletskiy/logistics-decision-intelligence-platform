import type { VehicleCompartmentInput } from "../../models/vehicle-compartment.input";

export class UpdateVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly compartmentId: string,
    readonly details: VehicleCompartmentInput,
  ) {}
}
