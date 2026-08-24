import * as assert from "node:assert/strict";
import { test } from "node:test";

import { UuidIdentifier } from "./uuid-identifier.js";

class TestId extends UuidIdentifier<TestId> {
  private constructor(value: unknown) {
    super(value, "Test identifier");
  }

  static from(value: unknown): TestId {
    return new TestId(value);
  }
}

test("UUID identifiers compare, stringify, and validate consistently", () => {
  const value = "8dfedee4-02cd-4a27-9cbd-93de25c0b63e";
  const first = TestId.from(value);
  const second = TestId.from(value);

  assert.ok(first.equals(second));
  assert.equal(first.toString(), value);
  assert.throws(() => TestId.from("not-a-uuid"), /valid UUID/);
});
