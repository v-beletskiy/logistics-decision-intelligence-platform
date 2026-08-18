import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../shared/infra/http/json-schema.pipe";
import { addressSchema, geoCoordinateSchema } from "../../../../../shared/infra/validation/value-objects/location";
import {
  dimensionsSchema,
  weightSchema,
} from "../../../../../shared/infra/validation/value-objects/measurement";
import { timeWindowSchema } from "../../../../../shared/infra/validation/value-objects/time";
import { createShipmentRequestSchema } from "./create-shipment.schema";
import {
  shipmentEndpointSchema,
  shipmentRouteParamsSchema,
} from "./shared-shipments.schema";
import { updateShipmentDetailsRequestSchema } from "./update-shipment-details.schema";

export {
  createShipmentRequestSchema,
  shipmentEndpointSchema,
  shipmentRouteParamsSchema,
  updateShipmentDetailsRequestSchema,
};

const shipmentSchemas = new SchemaRegistry([
  addressSchema,
  geoCoordinateSchema,
  timeWindowSchema,
  weightSchema,
  dimensionsSchema,
  shipmentEndpointSchema,
  shipmentRouteParamsSchema,
  createShipmentRequestSchema,
  updateShipmentDetailsRequestSchema,
]);

export const shipmentRouteParamsPipe = new JsonSchemaPipe(
  shipmentSchemas,
  shipmentRouteParamsSchema,
);

export const createShipmentRequestPipe = new JsonSchemaPipe(
  shipmentSchemas,
  createShipmentRequestSchema,
);

export const updateShipmentDetailsRequestPipe = new JsonSchemaPipe(
  shipmentSchemas,
  updateShipmentDetailsRequestSchema,
);
