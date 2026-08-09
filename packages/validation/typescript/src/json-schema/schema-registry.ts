import Ajv, {
  type AnySchemaObject,
  type ErrorObject,
  type ValidateFunction,
} from "ajv";
import addFormats from "ajv-formats";

export interface SchemaDefinition {
  readonly id: string;
  readonly schema: AnySchemaObject;
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

/**
 * Compiles trusted, application-owned JSON Schemas. It deliberately rejects coercion, default insertion, and silent
 * removal of unknown fields so callers preserve wire-level input semantics.
 */
export class SchemaRegistry {
  private readonly validators = new Map<string, ValidateFunction>();

  constructor(definitions: readonly SchemaDefinition[]) {
    const ajv = new Ajv({
      allErrors: false,
      coerceTypes: false,
      removeAdditional: false,
      strict: true,
      useDefaults: false,
      validateFormats: true,
    });
    addFormats(ajv);

    const ids = new Set<string>();
    for (const definition of definitions) {
      assertSchemaDefinition(definition, ids);
      ajv.addSchema(definition.schema, definition.id);
    }

    for (const definition of definitions) {
      const validator = ajv.getSchema(definition.id);
      if (validator === undefined) {
        throw new Error(`Schema ${definition.id} did not compile.`);
      }
      this.validators.set(definition.id, validator);
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

function assertSchemaDefinition(
  definition: SchemaDefinition,
  ids: Set<string>,
): void {
  if (definition.id.trim().length === 0) {
    throw new Error("A schema identifier must be specified.");
  }
  if (ids.has(definition.id)) {
    throw new Error(`Schema ${definition.id} is registered more than once.`);
  }
  if (definition.schema.$id !== definition.id) {
    throw new Error(
      `Schema ${definition.id} must declare the same $id in its JSON Schema.`,
    );
  }
  ids.add(definition.id);
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
