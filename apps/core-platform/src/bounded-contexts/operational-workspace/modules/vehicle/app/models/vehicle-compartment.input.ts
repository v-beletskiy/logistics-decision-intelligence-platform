import type { CapacityProps } from "../../domain/capacity.value-object.js";
import type { CompartmentType } from "../../domain/compartment.entity.js";

export interface VehicleCompartmentInput {
  readonly type: CompartmentType;
  readonly capacity: CapacityProps;
  readonly name?: string;
}
