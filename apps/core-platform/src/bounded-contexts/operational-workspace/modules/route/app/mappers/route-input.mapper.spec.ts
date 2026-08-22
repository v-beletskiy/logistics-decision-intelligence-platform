import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteStopOperationType } from "../../domain/route-stop.aggregate";
import { RouteInputMapper } from "./route-input.mapper";

test("RouteInputMapper converts route-stop references into domain details", () => {
  const details = RouteInputMapper.toStopPlan({
    shipmentId: "550e8400-e29b-41d4-a716-446655440000",
    operationType: RouteStopOperationType.Pickup,
    plannedArrivalAt: new Date("2026-08-10T08:00:00Z"),
    plannedDepartureAt: new Date("2026-08-10T09:00:00Z"),
  });

  assert.equal(
    details.shipmentId.value,
    "550e8400-e29b-41d4-a716-446655440000",
  );
  assert.equal(details.operationType, RouteStopOperationType.Pickup);
});
