import * as assert from "node:assert/strict";
import { test } from "node:test";

import { isUuid } from "./is-uuid.js";

test("recognizes canonical UUID strings", () => {
  assert.equal(isUuid("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isUuid("550E8400-E29B-41D4-A716-446655440000"), true);
});

test("rejects malformed UUID values", () => {
  assert.equal(isUuid("vehicle-1"), false);
  assert.equal(isUuid(42), false);
  assert.equal(isUuid(undefined), false);
});
