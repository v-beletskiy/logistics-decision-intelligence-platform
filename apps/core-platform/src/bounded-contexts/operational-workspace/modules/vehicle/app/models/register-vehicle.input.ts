import type { VehicleCompartmentInput } from "./vehicle-compartment.input";
import type { VehicleDetailsInput } from "./vehicle-details.input";

export interface RegisterVehicleInput extends VehicleDetailsInput {
  readonly compartments: readonly VehicleCompartmentInput[];
}
