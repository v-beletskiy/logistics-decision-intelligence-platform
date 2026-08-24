import assert from "node:assert/strict";
import test from "node:test";

import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { findRouteAnalysisContextByRouteId } from "./queries/route-analysis-context.find-by-route-id.queries.js";
import { PgRouteReadStore } from "./pg-route.read-store.js";

const tenantId = "00000000-0000-4000-8000-000000000010";
const routeId = "00000000-0000-4000-8000-000000000020";

function databaseWithRows(rows: readonly unknown[]): {
  readonly database: PgDatabase;
  readonly calls: Array<{ readonly statement: unknown; readonly params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  return {
    database: {
      exec: async (statement: unknown, params: unknown) => {
        calls.push({ statement, params });
        return statement === findRouteAnalysisContextByRouteId ? rows : [];
      },
    } as unknown as PgDatabase,
    calls,
  };
}

test("loads a Route analysis snapshot with one projection query", async () => {
  const fixture = databaseWithRows([
    {
      route_id: routeId,
      route_revision: "4",
      route_stop_id: "00000000-0000-4000-8000-000000000040",
      shipment_id: "00000000-0000-4000-8000-000000000030",
      operation_type: "PICKUP",
      requested_time_window_start_at: new Date("2026-01-01T09:00:00.000Z"),
      requested_time_window_end_at: new Date("2026-01-01T12:00:00.000Z"),
      planned_arrival_at: new Date("2026-01-01T10:00:00.000Z"),
      planned_departure_at: new Date("2026-01-01T10:05:00.000Z"),
      latitude: 50.45,
      longitude: 30.52,
    },
    {
      route_id: routeId,
      route_revision: "4",
      route_stop_id: "00000000-0000-4000-8000-000000000041",
      shipment_id: "00000000-0000-4000-8000-000000000031",
      operation_type: "DELIVERY",
      requested_time_window_start_at: new Date("2026-01-01T10:00:00.000Z"),
      requested_time_window_end_at: new Date("2026-01-01T14:00:00.000Z"),
      planned_arrival_at: new Date("2026-01-01T11:00:00.000Z"),
      planned_departure_at: new Date("2026-01-01T11:05:00.000Z"),
      latitude: 49.84,
      longitude: 24.03,
    },
  ]);

  const result = await new PgRouteReadStore(
    fixture.database,
  ).getAnalysisContext(tenantId, routeId);

  assert.deepEqual(result, {
    routeId,
    routeVersion: 4,
    stops: [
      {
        routeStopId: "00000000-0000-4000-8000-000000000040",
        shipmentId: "00000000-0000-4000-8000-000000000030",
        operationType: "PICKUP",
        location: { latitude: 50.45, longitude: 30.52 },
        requestedTimeWindowStartAt: new Date("2026-01-01T09:00:00.000Z"),
        requestedTimeWindowEndAt: new Date("2026-01-01T12:00:00.000Z"),
        plannedArrivalAt: new Date("2026-01-01T10:00:00.000Z"),
        plannedDepartureAt: new Date("2026-01-01T10:05:00.000Z"),
      },
      {
        routeStopId: "00000000-0000-4000-8000-000000000041",
        shipmentId: "00000000-0000-4000-8000-000000000031",
        operationType: "DELIVERY",
        location: { latitude: 49.84, longitude: 24.03 },
        requestedTimeWindowStartAt: new Date("2026-01-01T10:00:00.000Z"),
        requestedTimeWindowEndAt: new Date("2026-01-01T14:00:00.000Z"),
        plannedArrivalAt: new Date("2026-01-01T11:00:00.000Z"),
        plannedDepartureAt: new Date("2026-01-01T11:05:00.000Z"),
      },
    ],
  });
  assert.deepEqual(fixture.calls, [
    {
      statement: findRouteAnalysisContextByRouteId,
      params: { tenantId, routeId },
    },
  ]);
});

test("returns null when the Route does not exist", async () => {
  const fixture = databaseWithRows([]);

  const result = await new PgRouteReadStore(
    fixture.database,
  ).getAnalysisContext(tenantId, routeId);

  assert.equal(result, null);
});
