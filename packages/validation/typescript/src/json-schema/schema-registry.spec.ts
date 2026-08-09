import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  SchemaRegistry,
  SchemaValidationError,
  type SchemaDefinition,
} from "./schema-registry";

const schemaId = "urn:logistics-decision-intelligence:test-bc:test-event:v1";
const driverSchema: SchemaDefinition = {
  id: schemaId,
  schema: {
    $id: schemaId,
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", minLength: 1 },
    },
    required: ["id", "name"],
  },
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

test("SchemaRegistry rejects duplicate and mismatched identifiers at startup", () => {
  assert.throws(
    () => new SchemaRegistry([driverSchema, driverSchema]),
    /registered more than once/,
  );
  assert.throws(
    () =>
      new SchemaRegistry([
        {
          id: schemaId,
          schema: { ...driverSchema.schema, $id: `${schemaId}/other` },
        },
      ]),
    /must declare the same \$id/,
  );
});
