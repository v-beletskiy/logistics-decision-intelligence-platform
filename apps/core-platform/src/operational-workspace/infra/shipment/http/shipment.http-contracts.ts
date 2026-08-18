import type { FromSchema } from "json-schema-to-ts";

import type { addressSchema } from "../../../../shared/infra/validation/value-objects/location";
import type {
  dimensionsSchema,
  weightSchema,
} from "../../../../shared/infra/validation/value-objects/measurement";
import type { timeWindowSchema } from "../../../../shared/infra/validation/value-objects/time";
import type {
  createShipmentRequestSchema,
  shipmentEndpointSchema,
  shipmentRouteParamsSchema,
  updateShipmentDetailsRequestSchema,
} from "./schemas";

export type ShipmentRouteParams = FromSchema<typeof shipmentRouteParamsSchema>;

export type CreateShipmentRequest = FromSchema<
  typeof createShipmentRequestSchema,
  {
    references: [
      typeof addressSchema,
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
