import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../schema-id";

export const geoCoordinateSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("shared", "value-objects", "geo-coordinate", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["latitude", "longitude"],
  properties: {
    latitude: { type: "number", minimum: -90, maximum: 90 },
    longitude: { type: "number", minimum: -180, maximum: 180 },
  },
} as const satisfies IdentifiedSchema;