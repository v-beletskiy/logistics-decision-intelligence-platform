import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";

export const listRecommendationsRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "recommendations", "list-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["routeId"],
  properties: {
    routeId: { type: "string", format: "uuid" },
  },
} as const satisfies IdentifiedSchema;
