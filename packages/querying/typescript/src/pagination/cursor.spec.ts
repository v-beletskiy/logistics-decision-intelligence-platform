import * as assert from "node:assert/strict";
import { test } from "node:test";

import { createCursorScope, decodeCursor, encodeCursor } from "./cursor";

test("cursor round-trips within its query and criteria scope", () => {
  const scope = createCursorScope("driver.search", {
    tenantId: "tenant-1",
    status: "AVAILABLE",
  });
  const cursor = encodeCursor(scope, { name: "Doe" });

  assert.deepEqual(
    decodeCursor(cursor, scope, parseNamePosition),
    { name: "Doe" },
  );
});

test("cursor scopes use canonical criteria ordering", () => {
  assert.equal(
    createCursorScope("driver.search", { status: "AVAILABLE", depotId: null }),
    createCursorScope("driver.search", { depotId: null, status: "AVAILABLE" }),
  );
});

test("cursor rejects malformed and cross-criteria values", () => {
  const cursor = encodeCursor(
    createCursorScope("driver.search", { status: "AVAILABLE" }),
    { name: "Doe" },
  );
  assert.throws(
    () =>
      decodeCursor(
        cursor,
        createCursorScope("driver.search", { status: "SUSPENDED" }),
        parseNamePosition,
      ),
    /does not match/,
  );
  assert.throws(
    () => decodeCursor("not-json", "driver.search", parseNamePosition),
    /invalid/,
  );
});

function parseNamePosition(value: unknown): { readonly name: string } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("name" in value) ||
    typeof value.name !== "string"
  ) {
    throw new TypeError("Cursor name position is invalid.");
  }
  return { name: value.name };
}
