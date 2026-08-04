import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { optionalTrimmedString } from './optional-trimmed-string';
import { requireNonBlankString } from './require-non-blank-string';

test('requireNonBlankString returns canonical text', () => {
  assert.equal(requireNonBlankString('  value  ', 'Field'), 'value');
});

test('requireNonBlankString rejects missing and non-string values', () => {
  assert.throws(() => requireNonBlankString('  ', 'Field'), /Field must be specified/);
  assert.throws(() => requireNonBlankString(42, 'Field'), /Field must be text/);
});

test('optionalTrimmedString treats blank text as absent', () => {
  assert.equal(optionalTrimmedString('  value  ', 'Field'), 'value');
  assert.equal(optionalTrimmedString('  ', 'Field'), undefined);
  assert.equal(optionalTrimmedString(undefined, 'Field'), undefined);
});

test('optionalTrimmedString rejects non-string values', () => {
  assert.throws(
    () => optionalTrimmedString(42, 'Field'),
    /Field must be text when specified/,
  );
});
