import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";

export const changeDriverAvailabilityRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "drivers",
    "change-availability-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["available"],
  properties: { available: { type: "boolean" } },
} as const satisfies IdentifiedSchema;
