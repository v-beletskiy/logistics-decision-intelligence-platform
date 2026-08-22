import assert from "node:assert/strict";
import test from "node:test";

import {
  RoutePlanningSnapshotQuery,
  type RoutePlanningSnapshot,
} from "../../../../../operational-workspace/public-api/queries/route-planning-snapshot.query";
import { RouteOptimizationInputQueryAdapter } from "./route-optimization-input.query-adapter";

class StubRoutePlanningSnapshotQuery extends RoutePlanningSnapshotQuery {
  constructor(private readonly snapshot: RoutePlanningSnapshot) {
    super();
  }

  async get(): Promise<RoutePlanningSnapshot> {
    return this.snapshot;
  }
}

const routeId = "22222222-2222-4222-8222-222222222222";

function snapshot(stopCount: number): RoutePlanningSnapshot {
  return {
    routeId,
    routeVersion: 7,
    orderedStops: Array.from({ length: stopCount }, (_, index) => ({
      shipmentId: `${index + 1}`,
      location: { latitude: 50 + index, longitude: 30 + index },
      plannedArrivalAt: new Date("2026-01-01T10:00:00.000Z"),
      plannedDepartureAt: new Date("2026-01-01T10:05:00.000Z"),
    })),
  };
}

test("adapts an ordered Route snapshot to an optimization-specific input", async () => {
  const adapter = new RouteOptimizationInputQueryAdapter(
    new StubRoutePlanningSnapshotQuery(snapshot(2)),
  );

  const input = await adapter.get("tenant-1", routeId);

  assert.ok(input);
  assert.equal(input.fixedOrigin.shipmentId, "1");
  assert.deepEqual(
    input.stops.map((stop) => stop.shipmentId),
    ["2"],
  );
  assert.equal(input.routeVersion, 7);
});

test("rejects a Route snapshot without the required optimization anchor", async () => {
  const adapter = new RouteOptimizationInputQueryAdapter(
    new StubRoutePlanningSnapshotQuery(snapshot(0)),
  );

  await assert.rejects(
    adapter.get("tenant-1", routeId),
    /requires a fixed origin stop/,
  );
});
