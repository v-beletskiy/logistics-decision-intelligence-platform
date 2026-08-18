import { env } from "node:process";

import { createSchemaId } from "@logistics-decision-intelligence/validation/json-schema";

export const DEFAULT_SCHEMA_BASE_URI =
  "https://schemas.logistics-decision-intelligence.invalid";

export const schemaBaseUri =
  env.JSON_SCHEMA_BASE_URI ?? DEFAULT_SCHEMA_BASE_URI;

export type CorePlatformSchemaId<
  TNamespace extends string,
  TModule extends string,
  TName extends string,
  TVersion extends string,
> = `${typeof DEFAULT_SCHEMA_BASE_URI}/core-platform/${TNamespace}/${TModule}/${TName}/${TVersion}`;

export function corePlatformSchemaId<
  TNamespace extends string,
  TModule extends string,
  TName extends string,
  TVersion extends string,
>(
  namespace: TNamespace,
  module: TModule,
  name: TName,
  version: TVersion,
): CorePlatformSchemaId<TNamespace, TModule, TName, TVersion> {
  return createSchemaId(
    schemaBaseUri,
    "core-platform",
    namespace,
    module,
    name,
    version,
  ) as CorePlatformSchemaId<TNamespace, TModule, TName, TVersion>;
}