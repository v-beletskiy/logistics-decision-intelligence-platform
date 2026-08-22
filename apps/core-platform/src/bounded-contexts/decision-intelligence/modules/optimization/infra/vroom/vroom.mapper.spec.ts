import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { OptimizationStop } from "../../domain/optimization-stop";
import { VroomMapper } from "./vroom.mapper";

const fixedOrigin: OptimizationStop = {
  shipmentId: "origin",
  location: { latitude: 50.45, longitude: 30.52 },
  plannedArrivalAt: new Date("2026-08-10T08:00:00Z"),
  plannedDepartureAt: new Date("2026-08-10T08:00:00Z"),
};

const stop: OptimizationStop = {
  shipmentId: "destination",
  location: { latitude: 49.84, longitude: 24.03 },
  plannedArrivalAt: new Date("2026-08-10T09:00:00Z"),
  plannedDepartureAt: new Date("2026-08-10T09:30:00Z"),
};

test("maps the fixed origin separately from optimizable jobs", () => {
  const request = new VroomMapper().toRequest(fixedOrigin, [stop]);

  assert.deepEqual(request.vehicles[0]?.start, [30.52, 50.45]);
  assert.equal(request.jobs.length, 1);
  assert.equal(request.jobs[0]?.id, 1);
  assert.deepEqual(request.jobs[0]?.location, [24.03, 49.84]);
});
