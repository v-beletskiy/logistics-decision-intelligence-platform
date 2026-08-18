import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";

export const routeRouteParamsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "routes", "route-route-params", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["routeId"],
  properties: { routeId: { type: "string", format: "uuid" } },
} as const satisfies IdentifiedSchema;