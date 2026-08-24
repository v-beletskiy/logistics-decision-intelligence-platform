import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../schema-id.js";

export const addressSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("shared", "value-objects", "address", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["country", "city", "street", "buildingNumber", "postalCode"],
  properties: {
    country: { type: "string", minLength: 1, maxLength: 100 },
    stateOrRegion: { type: "string", minLength: 1, maxLength: 100 },
    city: { type: "string", minLength: 1, maxLength: 100 },
    street: { type: "string", minLength: 1, maxLength: 255 },
    buildingNumber: { type: "string", minLength: 1, maxLength: 100 },
    postalCode: { type: "string", minLength: 1, maxLength: 32 },
  },
} as const satisfies IdentifiedSchema;
