import {
  type Draft07Schema,
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
} from "@logistics-decision-intelligence/validation/json-schema";
import { MAX_CURSOR_LENGTH } from "@logistics-decision-intelligence/querying";

import { corePlatformSchemaId } from "../../../../../../../shared/infra/validation/schema-id.js";
import { DriverStatus } from "../../../domain/driver.aggregate.js";

const pageSearchModeSchema = {
  properties: {
    mode: { const: "page" },
    cursor: false,
  },
} as const satisfies Draft07Schema;

const cursorSearchModeSchema = {
  required: ["mode"],
  properties: {
    mode: { const: "cursor" },
    page: false,
  },
} as const satisfies Draft07Schema;

export const searchDriversRequestSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId("http", "drivers", "search-request", "v1"),
  type: "object",
  additionalProperties: false,
  properties: {
    mode: { type: "string", enum: ["page", "cursor"] },
    page: { type: "integer", minimum: 1, maximum: 10_000 },
    pageSize: { type: "integer", minimum: 1, maximum: 100 },
    cursor: {
      type: "string",
      minLength: 1,
      maxLength: MAX_CURSOR_LENGTH,
      pattern: "^[A-Za-z0-9_-]+$",
    },
    status: {
      type: "string",
      enum: [
        DriverStatus.Available,
        DriverStatus.Unavailable,
        DriverStatus.Suspended,
      ],
    },
    depotId: { type: "string", format: "uuid" },
    lastNamePrefix: { type: "string", minLength: 1, maxLength: 100 },
    certificationType: { type: "string", minLength: 1, maxLength: 100 },
    sortBy: {
      type: "string",
      enum: ["id", "name", "licenseNumber", "status"],
    },
    direction: { type: "string", enum: ["asc", "desc"] },
  },
  dependencies: { direction: ["sortBy"] },
  oneOf: [pageSearchModeSchema, cursorSearchModeSchema],
} as const satisfies IdentifiedSchema;
