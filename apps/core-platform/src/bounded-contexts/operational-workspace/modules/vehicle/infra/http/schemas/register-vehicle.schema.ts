import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import {
  vehicleCompartmentRequestFields,
  vehicleCompartmentRequestRequiredFields,
  vehicleDetailsRequestFields,
  vehicleDetailsRequestRequiredFields,
} from "./shared-vehicles.schema.js";

export const registerVehicleRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "vehicles", "register-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: [...vehicleDetailsRequestRequiredFields, "compartments"],
  properties: {
    ...vehicleDetailsRequestFields,
    compartments: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: vehicleCompartmentRequestRequiredFields,
        properties: vehicleCompartmentRequestFields,
      },
    },
  },
} as const satisfies IdentifiedSchema;
