import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { isRecord } from './is-record';

test('recognizes non-null, non-array objects', () => {
  assert.equal(isRecord({}), true);
  assert.equal(isRecord({ value: 1 }), true);
  assert.equal(isRecord(Object.create(null)), true);
});

test('rejects arrays, null and primitive values', () => {
  assert.equal(isRecord([]), false);
  assert.equal(isRecord(null), false);
  assert.equal(isRecord('value'), false);
  assert.equal(isRecord(1), false);
});
