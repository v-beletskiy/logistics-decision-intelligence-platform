import * as assert from "node:assert/strict";
import { test } from "node:test";

import { validatePagination } from "./pagination";

test("validatePagination applies bounded defaults to page and cursor input", () => {
  assert.deepEqual(validatePagination({ mode: "page" }), {
    mode: "page",
    page: 1,
    pageSize: 25,
  });
  assert.deepEqual(validatePagination({ mode: "cursor", cursor: "  " }), {
    mode: "cursor",
    pageSize: 25,
    cursor: undefined,
  });
});

test("validatePagination rejects abusive page sizes and offsets", () => {
  assert.throws(
    () => validatePagination({ mode: "page", pageSize: 101 }),
    /Page size/,
  );
  assert.throws(
    () => validatePagination({ mode: "page", page: 10_001 }),
    /Page must/,
  );
});
