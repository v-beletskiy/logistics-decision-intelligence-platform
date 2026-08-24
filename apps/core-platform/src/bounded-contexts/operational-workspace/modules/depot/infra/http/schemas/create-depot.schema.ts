import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import {
  depotDetailsRequestFields,
  depotDetailsRequestRequiredFields,
} from "./shared-depots.schema.js";

export const createDepotRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "depots", "create-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["details", "vehicleCapacity", "driverCapacity"],
  properties: {
    details: {
      type: "object",
      additionalProperties: false,
      required: depotDetailsRequestRequiredFields,
      properties: depotDetailsRequestFields,
    },
    vehicleCapacity: { type: "integer", minimum: 1 },
    driverCapacity: { type: "integer", minimum: 1 },
  },
} as const satisfies IdentifiedSchema;
