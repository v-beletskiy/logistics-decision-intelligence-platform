import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { CreateRouteRequest } from "./route.http-contracts";
import { RouteHttpMapper } from "./route.http-mapper";

const request: CreateRouteRequest = {
  stops: [
    {
      shipmentId: "00000000-0000-4000-8000-000000000001",
      operationType: "PICKUP",
      plannedArrivalAt: "2026-08-05T08:00:00.000Z",
      plannedDepartureAt: "2026-08-05T09:00:00.000Z",
    },
    {
      shipmentId: "00000000-0000-4000-8000-000000000001",
      operationType: "DELIVERY",
      plannedArrivalAt: "2026-08-05T10:00:00.000Z",
      plannedDepartureAt: "2026-08-05T11:00:00.000Z",
    },
  ],
};

test("RouteHttpMapper converts a create route request into stops input", () => {
  const input = RouteHttpMapper.toRouteStopsInput(request);

  assert.equal(input.length, 2);
  assert.deepEqual(input[0], {
    shipmentId: "00000000-0000-4000-8000-000000000001",
    operationType: "PICKUP",
    plannedArrivalAt: new Date("2026-08-05T08:00:00.000Z"),
    plannedDepartureAt: new Date("2026-08-05T09:00:00.000Z"),
  });
  assert.ok(input[1].plannedArrivalAt instanceof Date);
});

test("RouteHttpMapper maps a created route response", () => {
  assert.deepEqual(RouteHttpMapper.toCreatedRouteResponse("route-id"), {
    id: "route-id",
  });
});