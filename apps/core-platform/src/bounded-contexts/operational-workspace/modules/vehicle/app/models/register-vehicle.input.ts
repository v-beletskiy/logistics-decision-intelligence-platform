import type { VehicleCompartmentInput } from "./vehicle-compartment.input.js";
import type { VehicleDetailsInput } from "./vehicle-details.input.js";

export interface RegisterVehicleInput extends VehicleDetailsInput {
  readonly compartments: readonly VehicleCompartmentInput[];
}
