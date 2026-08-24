import * as assert from "node:assert/strict";
import { test } from "node:test";

import { optionalValidDate } from "./optional-valid-date.js";
import { requireValidDate } from "./require-valid-date.js";

test("requires a valid date and returns a defensive copy", () => {
  const input = new Date("2026-01-01T00:00:00.000Z");
  const result = requireValidDate(input, "Value");

  assert.deepEqual(result, input);
  assert.notEqual(result, input);
  assert.throws(() => requireValidDate(new Date(Number.NaN), "Value"));
  assert.throws(() => requireValidDate("2026-01-01", "Value"));
});

test("accepts an absent optional date or returns a defensive copy", () => {
  const input = new Date("2026-01-01T00:00:00.000Z");
  const result = optionalValidDate(input, "Value");

  assert.equal(optionalValidDate(undefined, "Value"), undefined);
  assert.deepEqual(result, input);
  assert.notEqual(result, input);
  assert.throws(() => optionalValidDate(null, "Value"));
});
