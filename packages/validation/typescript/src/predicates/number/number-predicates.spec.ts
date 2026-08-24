import * as assert from "node:assert/strict";
import { test } from "node:test";

import { isFiniteNumber } from "./is-finite-number.js";
import { isNonNegativeFiniteNumber } from "./is-non-negative-finite-number.js";
import { isPositiveFiniteNumber } from "./is-positive-finite-number.js";
import { isPositiveSafeInteger } from "./is-positive-safe-integer.js";

test("recognizes finite numbers", () => {
  assert.equal(isFiniteNumber(0), true);
  assert.equal(isFiniteNumber(Number.NaN), false);
  assert.equal(isFiniteNumber(Number.POSITIVE_INFINITY), false);
  assert.equal(isFiniteNumber("1"), false);
});

test("recognizes positive and non-negative finite numbers", () => {
  assert.equal(isNonNegativeFiniteNumber(0), true);
  assert.equal(isNonNegativeFiniteNumber(-1), false);
  assert.equal(isPositiveFiniteNumber(0), false);
  assert.equal(isPositiveFiniteNumber(1), true);
});

test("recognizes positive integers", () => {
  assert.equal(isPositiveSafeInteger(1), true);
  assert.equal(isPositiveSafeInteger(1.5), false);
  assert.equal(isPositiveSafeInteger(0), false);
  assert.equal(isPositiveSafeInteger(Number.POSITIVE_INFINITY), false);
  assert.equal(isPositiveSafeInteger(Number.MAX_SAFE_INTEGER + 1), false);
});
