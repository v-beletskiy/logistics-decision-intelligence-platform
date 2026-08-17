/**
 * Compile-time regression fixtures for the strict Draft-07 authoring types.
 *
 * These declarations are intentionally not used at runtime. `@ts-expect-error`
 * must continue to reject unknown keywords, while `readonlySchema` proves that
 * `as const` schemas remain assignable to IdentifiedSchema.
 */
import { JSON_SCHEMA_DRAFT_07 } from "./schema-dialects";
import type { IdentifiedSchema } from "./schema-registry";

const validSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: "https://schemas.example.com/typecheck",
  type: "object",
  properties: {
    name: { type: "string" },
  },
} satisfies IdentifiedSchema;

const readonlySchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: "https://schemas.example.com/readonly-typecheck",
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" },
  },
} as const satisfies IdentifiedSchema;

const invalidRootKeyword = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: "https://schemas.example.com/invalid-root-keyword",
  // @ts-expect-error Draft-07 does not define this keyword.
  typeDSSFDSFDSDfsd: "object",
} satisfies IdentifiedSchema;

const invalidNestedKeyword = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: "https://schemas.example.com/invalid-nested-keyword",
  type: "object",
  properties: {
    name: {
      // @ts-expect-error Draft-07 does not define this keyword.
      minLenght: 1,
    },
  },
} satisfies IdentifiedSchema;

void validSchema;
void readonlySchema;
void invalidRootKeyword;
void invalidNestedKeyword;
