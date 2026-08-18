import {
  type Draft07Schema,
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";
import {
  addressSchema,
  geoCoordinateSchema,
} from "../../../../../shared/infra/validation/value-objects/location";

export const depotRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "depots", "depot-route-params", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["depotId"],
  properties: { depotId: { type: "string", format: "uuid" } },
} as const satisfies IdentifiedSchema;

export const depotDetailsRequestFields = {
  name: { type: "string", minLength: 1, maxLength: 100 },
  address: { $ref: addressSchema.$id },
  location: { $ref: geoCoordinateSchema.$id },
} as const satisfies NonNullable<Draft07Schema["properties"]>;

export const depotDetailsRequestRequiredFields = [
  "name",
  "address",
  "location",
] as const satisfies readonly string[];
