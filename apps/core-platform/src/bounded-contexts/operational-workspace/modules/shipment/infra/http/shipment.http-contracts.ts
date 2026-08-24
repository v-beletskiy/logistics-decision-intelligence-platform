import type { FromSchema } from "json-schema-to-ts";

import type { addressSchema } from "../../../../../../shared/infra/validation/value-objects/location/index.js";
import type { geoCoordinateSchema } from "../../../../../../shared/infra/validation/value-objects/location/index.js";
import type {
  dimensionsSchema,
  weightSchema,
} from "../../../../../../shared/infra/validation/value-objects/measurement/index.js";
import type { timeWindowSchema } from "../../../../../../shared/infra/validation/value-objects/time/index.js";
import type {
  createShipmentRequestSchema,
  shipmentEndpointSchema,
  shipmentRouteParamsSchema,
  updateShipmentDetailsRequestSchema,
} from "./schemas/index.js";

export type ShipmentRouteParams = FromSchema<typeof shipmentRouteParamsSchema>;

export type CreateShipmentRequest = FromSchema<
  typeof createShipmentRequestSchema,
  {
    references: [
      typeof addressSchema,
      typeof geoCoordinateSchema,
      typeof timeWindowSchema,
      typeof shipmentEndpointSchema,
      typeof weightSchema,
      typeof dimensionsSchema,
    ];
  }
>;

export type UpdateShipmentDetailsRequest = FromSchema<
  typeof updateShipmentDetailsRequestSchema,
  {
    references: [
      typeof addressSchema,
      typeof geoCoordinateSchema,
      typeof timeWindowSchema,
      typeof shipmentEndpointSchema,
      typeof weightSchema,
      typeof dimensionsSchema,
    ];
  }
>;

export interface CreatedShipmentResponse {
  readonly id: string;
}
