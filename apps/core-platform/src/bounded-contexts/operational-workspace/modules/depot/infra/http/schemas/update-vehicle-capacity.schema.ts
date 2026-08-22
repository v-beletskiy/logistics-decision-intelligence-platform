import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id";

export const updateDepotVehicleCapacityRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "depots",
    "update-vehicle-capacity-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: ["vehicleCapacity"],
  properties: { vehicleCapacity: { type: "integer", minimum: 1 } },
} as const satisfies IdentifiedSchema;
