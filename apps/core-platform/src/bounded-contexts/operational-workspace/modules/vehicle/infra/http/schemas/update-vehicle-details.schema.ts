import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import {
  vehicleDetailsRequestFields,
  vehicleDetailsRequestRequiredFields,
} from "./shared-vehicles.schema.js";

export const updateVehicleDetailsRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "vehicles", "update-details-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: vehicleDetailsRequestRequiredFields,
  properties: vehicleDetailsRequestFields,
} as const satisfies IdentifiedSchema;
