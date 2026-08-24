import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";

export const updateDepotDriverCapacityRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "depots",
    "update-driver-capacity-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["driverCapacity"],
  properties: { driverCapacity: { type: "integer", minimum: 1 } },
} as const satisfies IdentifiedSchema;
