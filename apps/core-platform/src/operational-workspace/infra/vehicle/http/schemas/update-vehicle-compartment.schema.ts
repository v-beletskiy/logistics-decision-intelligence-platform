import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";
import {
  vehicleCompartmentRequestFields,
  vehicleCompartmentRequestRequiredFields,
} from "./shared-vehicles.schema";

export const updateVehicleCompartmentRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "http",
    "vehicles",
    "update-compartment-request",
    "v1",
  ),
  type: "object",
  additionalProperties: false,
  required: vehicleCompartmentRequestRequiredFields,
  properties: vehicleCompartmentRequestFields,
} as const satisfies IdentifiedSchema;