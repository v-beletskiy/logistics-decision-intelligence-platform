import * as assert from "node:assert/strict";
import { test } from "node:test";

import { requireUuid } from "./require-uuid.js";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

test("requireUuid returns a valid UUID unchanged", () => {
  assert.equal(requireUuid(uuid, "Identifier"), uuid);
});

test("requireUuid rejects malformed values", () => {
  assert.throws(() => requireUuid("vehicle-1", "Identifier"), /valid UUID/);
  assert.throws(() => requireUuid(undefined, "Identifier"), /valid UUID/);
});
