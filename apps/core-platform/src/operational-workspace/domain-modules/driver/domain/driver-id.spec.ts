import * as assert from "node:assert/strict";
import { test } from "node:test";

import { DriverId } from "./driver-id";

const driverId = "550e8400-e29b-41d4-a716-446655440000";

test("DriverId validates UUID values and preserves value equality", () => {
  const first = DriverId.from(driverId);
  const second = DriverId.from(driverId);

  assert.equal(first.value, driverId);
  assert.equal(first.equals(second), true);
  assert.throws(() => DriverId.from("driver-1"), /valid UUID/);
});
