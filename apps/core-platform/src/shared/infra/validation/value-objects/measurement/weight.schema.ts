import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { WeightUnit } from "../../../../domain/shared-kernel/value-objects/measurement";
import { corePlatformSchemaId } from "../../schema-id";

export const weightSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("shared", "value-objects", "weight", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["value", "unit"],
  properties: {
    value: { type: "number", minimum: 0 },
    unit: {
      type: "string",
      enum: [WeightUnit.Kilogram, WeightUnit.Gram, WeightUnit.Pound],
    },
  },
} as const satisfies IdentifiedSchema;