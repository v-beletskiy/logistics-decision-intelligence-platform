import type { FromSchema } from "json-schema-to-ts";

import {
  JSON_SCHEMA_DRAFT_07,
  type IdentifiedSchema,
} from "@logistics-decision-intelligence/validation/json-schema";

import { corePlatformSchemaId } from "../../../../../../shared/infra/validation/schema-id";

const matrixCellSchema = {
  anyOf: [{ type: "number", minimum: 0 }, { type: "null" }],
} as const;

const matrixSchema = {
  type: "array",
  items: {
    type: "array",
    items: matrixCellSchema,
  },
} as const;

export const osrmTableResponseSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "external",
    "osrm",
    "table-response",
    "v1",
  ),
  type: "object",
  additionalProperties: true,
  required: ["code"],
  properties: {
    code: { type: "string", minLength: 1 },
    distances: matrixSchema,
    durations: matrixSchema,
  },
} as const satisfies IdentifiedSchema;

export type OsrmTableResponse = FromSchema<typeof osrmTableResponseSchema>;
