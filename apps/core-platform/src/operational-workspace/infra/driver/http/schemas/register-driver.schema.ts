import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../shared/infra/validation/schema-id";
import {
  driverCertificationRequestSchema,
  driverDetailsRequestFields,
  driverDetailsRequestRequiredFields,
} from "./shared-drivers.schema";

export const registerDriverRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "drivers", "register-request", "v1"),
  type: "object",
  additionalProperties: false,
  required: driverDetailsRequestRequiredFields,
  properties: {
    ...driverDetailsRequestFields,
    certifications: {
      type: "array",
      maxItems: 10,
      items: { $ref: driverCertificationRequestSchema.$id },
    },
  },
} as const satisfies IdentifiedSchema;
