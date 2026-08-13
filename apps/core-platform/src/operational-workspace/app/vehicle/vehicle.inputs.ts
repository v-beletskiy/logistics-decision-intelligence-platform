import type { CompartmentProps } from "../../domain-modules/vehicle/domain/compartment.entity";
import type { VehicleDetails } from "../../domain-modules/vehicle/domain/vehicle.aggregate";

export interface VehicleCompartmentInput
  extends Pick<CompartmentProps, "type" | "capacity" | "name"> {}

export interface VehicleDetailsInput
  extends Pick<VehicleDetails, "registrationNumber" | "name"> {
  readonly depotId?: string;
}

export interface RegisterVehicleInput extends VehicleDetailsInput {
  readonly compartments: readonly VehicleCompartmentInput[];
}
