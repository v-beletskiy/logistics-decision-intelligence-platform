import * as assert from "node:assert/strict";
import { test } from "node:test";

import { isNonBlankString } from "./is-non-blank-string.js";

test("recognizes strings containing non-whitespace characters", () => {
  assert.equal(isNonBlankString(" vehicle "), true);
});

test("rejects blank and non-string values", () => {
  assert.equal(isNonBlankString(" \t\n "), false);
  assert.equal(isNonBlankString(42), false);
  assert.equal(isNonBlankString(undefined), false);
});
