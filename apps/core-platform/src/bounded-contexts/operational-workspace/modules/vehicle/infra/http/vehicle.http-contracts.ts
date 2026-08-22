import type { FromSchema } from "json-schema-to-ts";

import type {
  addVehicleCompartmentRequestSchema,
  changeVehicleAvailabilityRequestSchema,
  registerVehicleRequestSchema,
  updateVehicleCompartmentRequestSchema,
  updateVehicleDetailsRequestSchema,
  vehicleCompartmentRouteParamsSchema,
  vehicleRouteParamsSchema,
} from "./schemas";

export type VehicleRouteParams = FromSchema<typeof vehicleRouteParamsSchema>;

export type VehicleCompartmentRouteParams = FromSchema<
  typeof vehicleCompartmentRouteParamsSchema
>;

export type RegisterVehicleRequest = FromSchema<
  typeof registerVehicleRequestSchema
>;

export type UpdateVehicleDetailsRequest = FromSchema<
  typeof updateVehicleDetailsRequestSchema
>;

export type ChangeVehicleAvailabilityRequest = FromSchema<
  typeof changeVehicleAvailabilityRequestSchema
>;

export type AddVehicleCompartmentRequest = FromSchema<
  typeof addVehicleCompartmentRequestSchema
>;

export type UpdateVehicleCompartmentRequest = FromSchema<
  typeof updateVehicleCompartmentRequestSchema
>;

export interface CreatedVehicleResponse {
  readonly id: string;
}
