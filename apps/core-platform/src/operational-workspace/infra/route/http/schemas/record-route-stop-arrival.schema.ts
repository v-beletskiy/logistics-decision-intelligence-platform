import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";

export const recordRouteStopArrivalRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "routes",
    "record-stop-arrival-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["arrivedAt"],
  properties: { arrivedAt: { type: "string", format: "date-time" } },
} as const satisfies IdentifiedSchema;