import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";

export const assignmentRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "assignments",
    "assignment-route-params",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["assignmentId"],
  properties: { assignmentId: { type: "string", format: "uuid" } },
} as const satisfies IdentifiedSchema;
