import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";

import { DimensionUnit } from "../../../../domain/value-objects/measurement/index.js";
import { corePlatformSchemaId } from "../../schema-id.js";

export const dimensionsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("shared", "value-objects", "dimensions", "v1"),
  type: "object",
  additionalProperties: false,
  required: ["length", "width", "height", "unit"],
  properties: {
    length: { type: "number", exclusiveMinimum: 0 },
    width: { type: "number", exclusiveMinimum: 0 },
    height: { type: "number", exclusiveMinimum: 0 },
    unit: {
      type: "string",
      enum: [
        DimensionUnit.Meter,
        DimensionUnit.Centimeter,
        DimensionUnit.Millimeter,
        DimensionUnit.Inch,
      ],
    },
  },
} as const satisfies IdentifiedSchema;
