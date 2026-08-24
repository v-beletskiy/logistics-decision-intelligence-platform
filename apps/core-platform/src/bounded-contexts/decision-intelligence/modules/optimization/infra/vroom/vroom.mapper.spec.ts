import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { CostMatrix } from "../../domain/cost-matrix.js";
import {
  OptimizationStopOperationType,
  type OptimizationStop,
} from "../../domain/optimization-stop.js";
import { VroomMapper } from "./vroom.mapper.js";

const at = new Date("2026-08-10T08:00:00Z");

function stop(
  routeStopId: string,
  shipmentId: string,
  operationType: OptimizationStopOperationType,
  latitude: number,
  longitude: number,
): OptimizationStop {
  return {
    routeStopId,
    shipmentId,
    operationType,
    location: { latitude, longitude },
    requestedTimeWindowStartAt: at,
    requestedTimeWindowEndAt: new Date("2026-08-10T18:00:00Z"),
    plannedArrivalAt: at,
    plannedDepartureAt: new Date("2026-08-10T08:30:00Z"),
  };
}

const fixedOrigin = stop(
  "00000000-0000-4000-8000-000000000001",
  "shipment-a",
  OptimizationStopOperationType.Pickup,
  50.45,
  30.52,
);
const originDelivery = stop(
  "00000000-0000-4000-8000-000000000002",
  "shipment-a",
  OptimizationStopOperationType.Delivery,
  49.84,
  24.03,
);
const secondPickup = stop(
  "00000000-0000-4000-8000-000000000003",
  "shipment-b",
  OptimizationStopOperationType.Pickup,
  48,
  22,
);
const secondDelivery = stop(
  "00000000-0000-4000-8000-000000000004",
  "shipment-b",
  OptimizationStopOperationType.Delivery,
  47,
  21,
);

const matrix: CostMatrix = {
  labels: ["a", "b", "c", "d"],
  durationMatrix: [[0, 1, 2, 3], [1, 0, 2, 3], [2, 2, 0, 3], [3, 3, 3, 0]],
  distanceMatrix: [[0, 1, 2, 3], [1, 0, 2, 3], [2, 2, 0, 3], [3, 3, 3, 0]],
};

test("maps pickup-delivery pairs as VROOM shipments and the anchored delivery as a job", () => {
  const request = new VroomMapper().toRequest({
    fixedOrigin,
    stops: [originDelivery, secondPickup, secondDelivery],
    matrix,
  });

  assert.deepEqual(request.vehicles[0]?.start, [30.52, 50.45]);
  assert.equal(request.jobs.length, 1);
  assert.equal(request.jobs[0]?.id, 1);
  assert.equal(request.shipments.length, 1);
  assert.equal(request.shipments[0]?.pickup.id, 2);
  assert.equal(request.shipments[0]?.delivery.id, 3);
  assert.deepEqual(request.matrices.car.distances[0], [0, 1000, 2000, 3000]);
});
