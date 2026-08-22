import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  hydratePersistenceData,
  parsePersistedTimestamp,
} from "./persistence-hydration";
import { MalformedPersistenceDataException } from "./persistence.exceptions";

test("parses valid persisted timestamp text", () => {
  assert.equal(
    parsePersistedTimestamp("2026-08-21T10:30:00.000Z").toISOString(),
    "2026-08-21T10:30:00.000Z",
  );
});

test("rejects non-text and invalid persisted timestamps", () => {
  assert.throws(() => parsePersistedTimestamp(0), TypeError);
  assert.throws(() => parsePersistedTimestamp("not-a-date"), TypeError);
});

test("translates mapper hydration failures into infrastructure failures", () => {
  assert.throws(
    () => hydratePersistenceData("route", () => parsePersistedTimestamp("bad")),
    (error: unknown) =>
      error instanceof MalformedPersistenceDataException &&
      error.message.includes("Persisted route is malformed"),
  );
});
