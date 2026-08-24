import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import {
  shipmentDetailsRequestFields,
  shipmentDetailsRequestRequiredFields,
} from "./shared-shipments.schema.js";

export const createShipmentRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "shipments", "create-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: shipmentDetailsRequestRequiredFields,
  properties: shipmentDetailsRequestFields,
} as const satisfies IdentifiedSchema;
