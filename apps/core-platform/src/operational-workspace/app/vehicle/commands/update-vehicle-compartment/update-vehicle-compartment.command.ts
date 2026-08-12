import type { CompartmentProps } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";

export class UpdateVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly compartmentId: string,
    readonly details: CompartmentProps,
  ) {}
}
