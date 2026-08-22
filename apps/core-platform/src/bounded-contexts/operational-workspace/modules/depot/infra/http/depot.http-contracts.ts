import type { FromSchema } from "json-schema-to-ts";

import type { addressSchema } from "../../../../../../shared/infra/validation/value-objects/location";
import type { geoCoordinateSchema } from "../../../../../../shared/infra/validation/value-objects/location";
import type {
  createDepotRequestSchema,
  depotRouteParamsSchema,
  updateDepotDetailsRequestSchema,
  updateDepotDriverCapacityRequestSchema,
  updateDepotVehicleCapacityRequestSchema,
} from "./schemas";

export type DepotRouteParams = FromSchema<typeof depotRouteParamsSchema>;

// Create depot
export type CreateDepotRequest = FromSchema<
  typeof createDepotRequestSchema,
  { references: [typeof addressSchema, typeof geoCoordinateSchema] }
>;

export interface CreatedDepotResponse {
  readonly id: string;
}

// Update depot details
export type UpdateDepotDetailsRequest = FromSchema<
  typeof updateDepotDetailsRequestSchema,
  { references: [typeof addressSchema, typeof geoCoordinateSchema] }
>;

// Update capacities
export type UpdateDepotVehicleCapacityRequest = FromSchema<
  typeof updateDepotVehicleCapacityRequestSchema
>;

export type UpdateDepotDriverCapacityRequest = FromSchema<
  typeof updateDepotDriverCapacityRequestSchema
>;
