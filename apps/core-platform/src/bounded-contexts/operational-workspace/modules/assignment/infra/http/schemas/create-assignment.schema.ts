import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";

export const createAssignmentRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "assignments", "create-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["routeId", "vehicleId", "driverId"],
  properties: {
    routeId: { type: "string", format: "uuid" },
    vehicleId: { type: "string", format: "uuid" },
    driverId: { type: "string", format: "uuid" },
    initiatedByUserId: { type: "string", format: "uuid" },
  },
} as const satisfies IdentifiedSchema;
