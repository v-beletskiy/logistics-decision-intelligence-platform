import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  InvalidPaginationError,
  MAX_CURSOR_LENGTH,
  validatePagination,
} from "./pagination.js";

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
  assert.throws(
    () =>
      validatePagination({
        mode: "cursor",
        cursor: "x".repeat(MAX_CURSOR_LENGTH + 1),
      }),
    /Cursor must not exceed/,
  );
});

test("InvalidPaginationError owns its stable machine code", () => {
  assert.equal(
    new InvalidPaginationError("Invalid pagination.").code,
    "query.pagination-invalid",
  );
});
