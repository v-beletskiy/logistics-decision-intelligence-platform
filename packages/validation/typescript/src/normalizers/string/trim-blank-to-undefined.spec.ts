import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { trimBlankToUndefined } from './trim-blank-to-undefined';

test('trims non-blank strings', () => {
  assert.equal(trimBlankToUndefined('  vehicle  '), 'vehicle');
});

test('converts blank and absent strings to undefined', () => {
  assert.equal(trimBlankToUndefined(' \t\n '), undefined);
  assert.equal(trimBlankToUndefined(undefined), undefined);
});
