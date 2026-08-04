import type { CompartmentProps } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class UpdateVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly compartmentId: string,
    readonly details: CompartmentProps,
    readonly identity: Identity,
  ) {}
}
