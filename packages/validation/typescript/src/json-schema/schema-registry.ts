import Ajv, {
  type AnySchemaObject,
  type ErrorObject,
  type ValidateFunction,
} from "ajv";
import addFormats from "ajv-formats";
import type { JSONSchema7 } from "json-schema";

import { JSON_SCHEMA_DRAFT_07 } from "./schema-dialects";

/** A self-identifying JSON Schema written in the Draft-07 dialect. */
export type Draft07Schema = ReadonlyDeep<JSONSchema7>;

export type IdentifiedSchema = Draft07Schema & {
  readonly $id: string;
  readonly $schema: typeof JSON_SCHEMA_DRAFT_07;
};

/** Allows `as const` schema literals without weakening Draft-07 keyword checks. */
type ReadonlyDeep<T> = T extends (...arguments_: never[]) => unknown
  ? T
  : T extends readonly (infer TItem)[]
    ? readonly ReadonlyDeep<TItem>[]
    : T extends object
      ? { readonly [TKey in keyof T]: ReadonlyDeep<T[TKey]> }
      : T;

export interface SchemaRegistryOptions {
  readonly coerceTypes?: boolean;
  readonly useDefaults?: boolean;
}

export interface ValidationIssue {
  readonly code: string;
  readonly pointer: string;
  readonly keyword: string;
  readonly message: string;
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

/** Raised when untrusted data does not satisfy a registered JSON Schema. */
export class SchemaValidationError extends Error {
  constructor(
    readonly schemaId: string,
    readonly issues: readonly ValidationIssue[],
  ) {
    super(`Input does not satisfy schema ${schemaId}.`);
    this.name = "SchemaValidationError";
  }
}

/** Compiles trusted, application-owned JSON Schemas once at adapter startup. */
export class SchemaRegistry {
  private readonly validators = new Map<string, ValidateFunction>();

  constructor(
    schemas: readonly IdentifiedSchema[],
    options: SchemaRegistryOptions = {},
  ) {
    const ajv = new Ajv({
      allErrors: false,
      coerceTypes: options.coerceTypes ?? false,
      removeAdditional: false,
      strict: true,
      useDefaults: options.useDefaults ?? false,
      validateFormats: true,
    });
    addFormats(ajv);

    const ids = new Set<string>();
    for (const schema of schemas) {
      assertSchema(schema, ids);
      ajv.addSchema(schema as AnySchemaObject);
    }

    for (const schema of schemas) {
      const validator = ajv.getSchema(schema.$id);
      if (validator === undefined) {
        throw new Error(`Schema ${schema.$id} did not compile.`);
      }
      this.validators.set(schema.$id, validator);
    }
  }

  validate<T>(schemaId: string, value: unknown): ValidationResult<T> {
    const validator = this.validators.get(schemaId);
    if (validator === undefined) {
      throw new Error(`Schema ${schemaId} is not registered.`);
    }

    if (validator(value)) {
      return { ok: true, value: value as T };
    }

    return { ok: false, issues: toValidationIssues(validator.errors) };
  }

  assert<T>(schemaId: string, value: unknown): T {
    const result = this.validate<T>(schemaId, value);
    if (result.ok) return result.value;
    throw new SchemaValidationError(schemaId, result.issues);
  }
}

function assertSchema(schema: IdentifiedSchema, ids: Set<string>): void {
  if (schema.$schema !== JSON_SCHEMA_DRAFT_07) {
    throw new Error(
      `Schemas must declare the ${JSON_SCHEMA_DRAFT_07} dialect.`,
    );
  }
  if (schema.$id.trim().length === 0 || !URL.canParse(schema.$id)) {
    throw new Error("A schema identifier must be specified.");
  }
  if (ids.has(schema.$id)) {
    throw new Error(`Schema ${schema.$id} is registered more than once.`);
  }
  ids.add(schema.$id);
}

function toValidationIssues(
  errors: readonly ErrorObject[] | null | undefined,
): readonly ValidationIssue[] {
  return (errors ?? []).map((error) => ({
    code: validationCode(error.keyword),
    pointer: errorPointer(error),
    keyword: error.keyword,
    message: error.message ?? "Validation failed.",
  }));
}

function errorPointer(error: ErrorObject): string {
  const missingProperty =
    error.keyword === "required" &&
    typeof error.params.missingProperty === "string"
      ? error.params.missingProperty
      : error.keyword === "additionalProperties" &&
          typeof error.params.additionalProperty === "string"
        ? error.params.additionalProperty
        : undefined;
  return missingProperty === undefined
    ? error.instancePath
    : `${error.instancePath}/${escapeJsonPointerToken(missingProperty)}`;
}

function escapeJsonPointerToken(token: string): string {
  return token.replaceAll("~", "~0").replaceAll("/", "~1");
}

function validationCode(keyword: string): string {
  const codes: Readonly<Record<string, string>> = {
    additionalProperties: "UNEXPECTED_PROPERTY",
    enum: "ENUM_MISMATCH",
    format: "FORMAT_MISMATCH",
    maximum: "MAXIMUM",
    maxItems: "MAX_ITEMS",
    maxLength: "MAX_LENGTH",
    minimum: "MINIMUM",
    minItems: "MIN_ITEMS",
    minLength: "MIN_LENGTH",
    pattern: "PATTERN_MISMATCH",
    required: "REQUIRED",
    type: "TYPE_MISMATCH",
    uniqueItems: "DUPLICATE_ITEM",
  };
  return codes[keyword] ?? "VALIDATION_FAILED";
}
