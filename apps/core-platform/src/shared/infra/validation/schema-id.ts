import { env } from "node:process";

import { createSchemaId } from "@logistics-decision-intelligence/validation/json-schema";

export const DEFAULT_SCHEMA_BASE_URI =
  "https://schemas.logistics-decision-intelligence.invalid";

export const schemaBaseUri =
  env.JSON_SCHEMA_BASE_URI ?? DEFAULT_SCHEMA_BASE_URI;

export function corePlatformSchemaId(
  ...pathSegments: readonly string[]
): string {
  return createSchemaId(schemaBaseUri, "core-platform", ...pathSegments);
}
