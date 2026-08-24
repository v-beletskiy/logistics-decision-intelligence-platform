import * as assert from "node:assert/strict";
import { test } from "node:test";

import { isPlainObject } from "./is-plain-object.js";

test("recognizes object literals and null-prototype maps", () => {
  assert.equal(isPlainObject({}), true);
  assert.equal(isPlainObject({ value: 1 }), true);
  assert.equal(isPlainObject(Object.create(null)), true);
});

test("rejects arrays, class instances, null and primitive values", () => {
  assert.equal(isPlainObject([]), false);
  assert.equal(isPlainObject(null), false);
  assert.equal(isPlainObject("value"), false);
  assert.equal(isPlainObject(1), false);
  assert.equal(isPlainObject(new Date()), false);
  assert.equal(isPlainObject(new (class Example {})()), false);
});
