import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";

export const recordRouteStopDepartureRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "routes",
    "record-stop-departure-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["departedAt"],
  properties: { departedAt: { type: "string", format: "date-time" } },
} as const satisfies IdentifiedSchema;