import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteStopId } from "./route-stop-id.js";

const routeId = "550e8400-e29b-41d4-a716-446655440000";

test("RouteStopId validates UUID values", () => {
  assert.equal(RouteStopId.from(routeId).toString(), routeId);
  assert.throws(() => RouteStopId.from(null), /valid UUID/);
});
