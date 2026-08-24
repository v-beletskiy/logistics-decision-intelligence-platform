import {
  type Draft07Schema,
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import {
  addressSchema,
  geoCoordinateSchema,
} from "../../../../../../../shared/infra/validation/value-objects/location/index.js";
import {
  dimensionsSchema,
  weightSchema,
} from "../../../../../../../shared/infra/validation/value-objects/measurement/index.js";
import { timeWindowSchema } from "../../../../../../../shared/infra/validation/value-objects/time/index.js";

export const shipmentRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "shipments", "shipment-route-params", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["shipmentId"],
  properties: { shipmentId: { type: "string", format: "uuid" } },
} as const satisfies IdentifiedSchema;

export const shipmentEndpointSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "shipments", "shipment-endpoint", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["address", "location", "timeWindow"],
  properties: {
    address: { $ref: addressSchema.$id },
    location: { $ref: geoCoordinateSchema.$id },
    timeWindow: { $ref: timeWindowSchema.$id },
  },
} as const satisfies IdentifiedSchema;

export const shipmentDetailsRequestFields = {
  pickup: { $ref: shipmentEndpointSchema.$id },
  delivery: { $ref: shipmentEndpointSchema.$id },
  weight: { $ref: weightSchema.$id },
  dimensions: { $ref: dimensionsSchema.$id },
} as const satisfies NonNullable<Draft07Schema["properties"]>;

export const shipmentDetailsRequestRequiredFields = [
  "pickup",
  "delivery",
  "weight",
  "dimensions",
] as const satisfies readonly string[];
