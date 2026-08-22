import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id";
import {
  driverDetailsRequestFields,
  driverDetailsRequestRequiredFields,
} from "./shared-drivers.schema";

export const updateDriverRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "drivers", "update-details-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: driverDetailsRequestRequiredFields,
  properties: driverDetailsRequestFields,
} as const satisfies IdentifiedSchema;
