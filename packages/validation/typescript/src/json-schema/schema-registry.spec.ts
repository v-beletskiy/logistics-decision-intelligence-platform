import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  SchemaRegistry,
  SchemaValidationError,
  type IdentifiedSchema,
} from "./schema-registry.js";
import { JSON_SCHEMA_DRAFT_07 } from "./schema-dialects.js";
import {
  jsonSchemaPrimitives,
  positiveSafeIntegerSchemaRef,
} from "./schema-primitives.js";

const schemaId = "urn:logistics-decision-intelligence:test-bc:test-event:v1";
const driverSchema: IdentifiedSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: schemaId,
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1 },
  },
  required: ["id", "name"],
};

test("SchemaRegistry validates trusted schemas and returns typed values", () => {
  const registry = new SchemaRegistry([driverSchema]);
  const result = registry.validate<{ id: string; name: string }>(schemaId, {
    id: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    name: "Alex",
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      id: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      name: "Alex",
    },
  });
});

test("SchemaRegistry preserves input and reports a stable JSON Pointer", () => {
  const registry = new SchemaRegistry([driverSchema]);
  const input = {
    id: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    name: "Alex",
    unexpected: true,
  };

  const result = registry.validate(schemaId, input);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.deepEqual(result.issues, [
      {
        code: "UNEXPECTED_PROPERTY",
        pointer: "/unexpected",
        keyword: "additionalProperties",
        message: "must NOT have additional properties",
      },
    ]);
  }
  assert.deepEqual(input, {
    id: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    name: "Alex",
    unexpected: true,
  });
});

test("SchemaRegistry assert throws structured validation failures", () => {
  const registry = new SchemaRegistry([driverSchema]);

  assert.throws(
    () => registry.assert(schemaId, { name: "Alex" }),
    (error: unknown) => {
      assert.ok(error instanceof SchemaValidationError);
      assert.equal(error.schemaId, schemaId);
      assert.deepEqual(error.issues[0]?.pointer, "/id");
      return true;
    },
  );
});

test("SchemaRegistry rejects duplicate and invalid identifiers at startup", () => {
  assert.throws(
    () => new SchemaRegistry([driverSchema, driverSchema]),
    /registered more than once/,
  );
  assert.throws(
    () =>
      new SchemaRegistry([
        {
          ...driverSchema,
          $id: "not an absolute URI",
        },
      ]),
    /identifier must be specified/,
  );
});

test("SchemaRegistry rejects a runtime schema with another dialect", () => {
  const schemaWithUnexpectedDialect = {
    ...driverSchema,
    $schema: "https://json-schema.org/draft/2020-12/schema",
  } as unknown as IdentifiedSchema;

  assert.throws(
    () => new SchemaRegistry([schemaWithUnexpectedDialect]),
    /must declare the http:\/\/json-schema.org\/draft-07\/schema#/,
  );
});

test("SchemaRegistry can declaratively coerce query-string primitives", () => {
  const querySchemaId = `${schemaId}:query`;
  const registry = new SchemaRegistry(
    [
      {
        $schema: JSON_SCHEMA_DRAFT_07,
        $id: querySchemaId,
        type: "object",
        properties: {
          mode: { type: "string", enum: ["page", "cursor"], default: "page" },
          page: { type: "integer", minimum: 1 },
        },
      },
    ],
    { coerceTypes: true, useDefaults: true },
  );
  const query: { mode?: string; page?: string | number } = { page: "2" };

  assert.deepEqual(registry.assert(querySchemaId, query), {
    mode: "page",
    page: 2,
  });
});

test("SchemaRegistry resolves explicitly registered shared schema references", () => {
  const primitiveReferenceSchemaId = `${schemaId}:primitive-reference`;
  const registry = new SchemaRegistry([
    jsonSchemaPrimitives,
    {
      $schema: JSON_SCHEMA_DRAFT_07,
      $id: primitiveReferenceSchemaId,
      type: "object",
      required: ["port"],
      properties: { port: positiveSafeIntegerSchemaRef },
    },
  ]);

  assert.deepEqual(registry.assert(primitiveReferenceSchemaId, { port: 1 }), {
    port: 1,
  });
  assert.throws(
    () => registry.assert(primitiveReferenceSchemaId, { port: 0 }),
    SchemaValidationError,
  );
});
