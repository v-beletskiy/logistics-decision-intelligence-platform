import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { requireNonNegativeFiniteNumber } from './require-non-negative-finite-number';
import { requirePositiveFiniteNumber } from './require-positive-finite-number';
import { requirePositiveInteger } from './require-positive-integer';

test('requires finite non-negative numbers', () => {
  assert.equal(requireNonNegativeFiniteNumber(0, 'Value'), 0);
  assert.throws(
    () => requireNonNegativeFiniteNumber(-1, 'Value'),
    /cannot be negative/,
  );
  assert.throws(
    () => requireNonNegativeFiniteNumber(Number.NaN, 'Value'),
    /finite number/,
  );
});

test('requires finite positive numbers', () => {
  assert.equal(requirePositiveFiniteNumber(1, 'Value'), 1);
  assert.throws(
    () => requirePositiveFiniteNumber(0, 'Value'),
    /greater than zero/,
  );
});

test('requires positive integers', () => {
  assert.equal(requirePositiveInteger(1, 'Value'), 1);
  assert.throws(() => requirePositiveInteger(1.5, 'Value'), /positive integer/);
  assert.throws(() => requirePositiveInteger(0, 'Value'), /positive integer/);
});
