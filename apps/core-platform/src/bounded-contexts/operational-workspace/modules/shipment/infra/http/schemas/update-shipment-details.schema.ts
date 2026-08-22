import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id";
import {
  shipmentDetailsRequestFields,
  shipmentDetailsRequestRequiredFields,
} from "./shared-shipments.schema";

export const updateShipmentDetailsRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "shipments",
    "update-details-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: shipmentDetailsRequestRequiredFields,
  properties: shipmentDetailsRequestFields,
} as const satisfies IdentifiedSchema;
