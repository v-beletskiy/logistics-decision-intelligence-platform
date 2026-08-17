import * as assert from "node:assert/strict";
import { test } from "node:test";

import { createSchemaId } from "./schema-id";

test("createSchemaId appends a stable schema path to an owned HTTPS namespace", () => {
  assert.equal(
    createSchemaId(
      "https://schemas.example.com/contracts",
      "core-platform",
      "http",
      "v1",
      "drivers",
      "register-request",
    ),
    "https://schemas.example.com/contracts/core-platform/http/v1/drivers/register-request",
  );
});

test("createSchemaId rejects unsafe namespaces and unstable path segments", () => {
  assert.throws(
    () => createSchemaId("http://schemas.example.com", "drivers"),
    /must be an HTTPS URI/,
  );
  assert.throws(
    () => createSchemaId("https://schemas.example.com", "Driver Requests"),
    /lowercase kebab-case/,
  );
});
