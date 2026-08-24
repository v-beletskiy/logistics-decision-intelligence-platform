import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { RouteAnalysisContext } from "../../../../../../shared/infra/grpc/generated/operational_workspace/v1/route_analysis_types.js";
import type { RouteAnalysisContextResult } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.result.js";
import { RouteStopOperationType } from "../../domain/route-stop.aggregate.js";
import { RouteAnalysisGrpcMapper } from "./route-analysis.grpc-mapper.js";

test("RouteAnalysisGrpcMapper maps a loaded route context", () => {
  const context: RouteAnalysisContextResult = {
    routeId: "00000000-0000-4000-8000-000000000001",
    routeVersion: 3,
    stops: [
      {
        routeStopId: "00000000-0000-4000-8000-000000000003",
        shipmentId: "00000000-0000-4000-8000-000000000002",
        operationType: RouteStopOperationType.Pickup,
        location: { latitude: 50.4501, longitude: 30.5234 },
        requestedTimeWindowStartAt: new Date("2026-08-10T08:00:00.000Z"),
        requestedTimeWindowEndAt: new Date("2026-08-10T09:00:00.000Z"),
        plannedArrivalAt: new Date("2026-08-10T08:00:00.000Z"),
        plannedDepartureAt: new Date("2026-08-10T09:00:00.000Z"),
      },
    ],
  };

  const mapped: RouteAnalysisContext =
    RouteAnalysisGrpcMapper.toRouteAnalysisContext(context);

  assert.equal(mapped.routeId, context.routeId);
  assert.equal(mapped.routeVersion, context.routeVersion);
  assert.equal(mapped.stops.length, 1);
  assert.equal(mapped.stops[0].shipmentId, context.stops[0].shipmentId);
  assert.deepEqual(mapped.stops[0].location, {
    latitude: 50.4501,
    longitude: 30.5234,
  });
  assert.ok(mapped.stops[0].plannedArrivalAt instanceof Date);
  assert.ok(mapped.stops[0].plannedDepartureAt instanceof Date);
});
