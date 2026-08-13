import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteStopOperationType } from "../../domain-modules/route/domain/route-stop.aggregate";
import { ShipmentId } from "../../domain-modules/shipment/domain/shipment-id";
import { RoutePlanningPolicy } from "./route-planning.policy";

const policy = new RoutePlanningPolicy();
const start = new Date("2026-08-05T08:00:00Z");
const end = new Date("2026-08-05T09:00:00Z");
const shipmentId = ShipmentId.generate();

test("RoutePlanningPolicy accepts one ordered pickup-delivery pair", () => {
  assert.doesNotThrow(() =>
    policy.assertCanCreate([
      {
        shipmentId,
        operationType: RouteStopOperationType.Pickup,
        plannedArrivalAt: start,
        plannedDepartureAt: end,
      },
      {
        shipmentId,
        operationType: RouteStopOperationType.Delivery,
        plannedArrivalAt: start,
        plannedDepartureAt: end,
      },
    ]),
  );
});

test("RoutePlanningPolicy rejects delivery before pickup", () => {
  assert.throws(
    () =>
      policy.assertCanCreate([
        {
          shipmentId,
          operationType: RouteStopOperationType.Delivery,
          plannedArrivalAt: start,
          plannedDepartureAt: end,
        },
        {
          shipmentId,
          operationType: RouteStopOperationType.Pickup,
          plannedArrivalAt: start,
          plannedDepartureAt: end,
        },
      ]),
    /must precede its delivery/,
  );
});
