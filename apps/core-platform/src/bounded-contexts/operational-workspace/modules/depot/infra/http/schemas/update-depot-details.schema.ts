import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import {
  depotDetailsRequestFields,
  depotDetailsRequestRequiredFields,
} from "./shared-depots.schema.js";

export const updateDepotDetailsRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "depots", "update-details-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["details"],
  properties: {
    details: {
      type: "object",
      additionalProperties: false,
      required: depotDetailsRequestRequiredFields,
      properties: depotDetailsRequestFields,
    },
  },
} as const satisfies IdentifiedSchema;
