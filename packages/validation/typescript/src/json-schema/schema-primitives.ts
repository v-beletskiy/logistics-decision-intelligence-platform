import { JSON_SCHEMA_DRAFT_07 } from "./schema-dialects.js";

export const JSON_SCHEMA_PRIMITIVES_SCHEMA_ID =
  "https://schemas.logistics-decision-intelligence.invalid/shared/json-schema/primitives/v1" as const;

const POSITIVE_SAFE_INTEGER_SCHEMA_REFERENCE: `${typeof JSON_SCHEMA_PRIMITIVES_SCHEMA_ID}#/definitions/positiveSafeInteger` = `${JSON_SCHEMA_PRIMITIVES_SCHEMA_ID}#/definitions/positiveSafeInteger`;
const BASE64_ENCODED_TEXT_SCHEMA_REFERENCE: `${typeof JSON_SCHEMA_PRIMITIVES_SCHEMA_ID}#/definitions/base64EncodedText` = `${JSON_SCHEMA_PRIMITIVES_SCHEMA_ID}#/definitions/base64EncodedText`;

/**
 * Versioned generic schemas registered automatically by SchemaRegistry.
 */
export const jsonSchemaPrimitives = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: JSON_SCHEMA_PRIMITIVES_SCHEMA_ID,
  definitions: {
    positiveSafeInteger: {
      type: "integer",
      minimum: 1,
      maximum: Number.MAX_SAFE_INTEGER,
    },
    base64EncodedText: {
      type: "string",
      minLength: 4,
      pattern:
        "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
    },
  },
} as const;

export const positiveSafeIntegerSchemaRef = {
  $ref: POSITIVE_SAFE_INTEGER_SCHEMA_REFERENCE,
} as const;

export const base64EncodedTextSchemaRef = {
  $ref: BASE64_ENCODED_TEXT_SCHEMA_REFERENCE,
} as const;
