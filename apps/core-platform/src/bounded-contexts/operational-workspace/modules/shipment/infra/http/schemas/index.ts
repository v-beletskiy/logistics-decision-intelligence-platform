import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe.js";
import {
  addressSchema,
  geoCoordinateSchema,
} from "../../../../../../../shared/infra/validation/value-objects/location/index.js";
import {
  dimensionsSchema,
  weightSchema,
} from "../../../../../../../shared/infra/validation/value-objects/measurement/index.js";
import { timeWindowSchema } from "../../../../../../../shared/infra/validation/value-objects/time/index.js";
import { createShipmentRequestSchema } from "./create-shipment.schema.js";
import {
  shipmentEndpointSchema,
  shipmentRouteParamsSchema,
} from "./shared-shipments.schema.js";
import { updateShipmentDetailsRequestSchema } from "./update-shipment-details.schema.js";

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
