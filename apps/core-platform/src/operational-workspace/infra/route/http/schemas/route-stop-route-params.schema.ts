import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";

export const routeStopRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "routes",
    "route-stop-route-params",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["routeId", "sequence"],
  properties: {
    routeId: { type: "string", format: "uuid" },
    sequence: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const satisfies IdentifiedSchema;