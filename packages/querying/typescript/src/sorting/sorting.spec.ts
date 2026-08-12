import * as assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeSortDirection } from "./sorting";

test("normalizeSortDirection applies its default and preserves valid values", () => {
  assert.equal(normalizeSortDirection(undefined), "asc");
  assert.equal(normalizeSortDirection(undefined, "desc"), "desc");
  assert.equal(normalizeSortDirection("desc"), "desc");
});

test("normalizeSortDirection rejects unsupported values", () => {
  assert.throws(() => normalizeSortDirection("sideways"), /invalid/);
});
