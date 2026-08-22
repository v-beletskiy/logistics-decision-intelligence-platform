import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id";

export const reassignDriverRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "assignments",
    "reassign-driver-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["driverId"],
  properties: {
    driverId: { type: "string", format: "uuid" },
    initiatedByUserId: { type: "string", format: "uuid" },
  },
} as const satisfies IdentifiedSchema;
