import * as assert from "node:assert/strict";
import { test } from "node:test";

import { isEnumValue } from "./is-enum-value.js";

enum Availability {
  Available = "AVAILABLE",
  Unavailable = "UNAVAILABLE",
}

test("recognizes string enum values", () => {
  assert.equal(isEnumValue(Availability, Availability.Available), true);
});

test("rejects values outside a string enum", () => {
  assert.equal(isEnumValue(Availability, "Available"), false);
  assert.equal(isEnumValue(Availability, 1), false);
  assert.equal(isEnumValue(Availability, undefined), false);
});
