import type { CapacityProps } from "../../domain/capacity.value-object";
import type { CompartmentType } from "../../domain/compartment.entity";

export interface VehicleCompartmentInput {
  readonly type: CompartmentType;
  readonly capacity: CapacityProps;
  readonly name?: string;
}
