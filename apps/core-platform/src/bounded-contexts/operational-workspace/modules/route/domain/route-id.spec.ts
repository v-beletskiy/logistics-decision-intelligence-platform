import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteId } from "./route-id.js";

const routeId = "550e8400-e29b-41d4-a716-446655440000";

test("RouteId validates UUID values and preserves value equality", () => {
  const first = RouteId.from(routeId);
  const second = RouteId.from(routeId);

  assert.equal(first.value, routeId);
  assert.equal(first.equals(second), true);
  assert.throws(() => RouteId.from("route-1"), /valid UUID/);
});
