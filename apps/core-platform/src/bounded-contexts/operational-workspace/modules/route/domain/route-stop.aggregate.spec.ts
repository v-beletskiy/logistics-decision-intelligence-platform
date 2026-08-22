import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  RouteStop,
  RouteStopOperationType,
  RouteStopStatus,
} from "./route-stop.aggregate";
import { RouteId } from "./route-id";
import { ShipmentId } from "../../shipment/domain/shipment-id";

function createStop(): RouteStop {
  return RouteStop.create({
    routeId: RouteId.generate(),
    shipmentId: ShipmentId.generate(),
    sequence: 1,
    operationType: RouteStopOperationType.Pickup,
    plannedArrivalAt: new Date("2026-08-05T08:00:00Z"),
    plannedDepartureAt: new Date("2026-08-05T09:00:00Z"),
  });
}

test("RouteStop records arrival then departure as its execution lifecycle", () => {
  const stop = createStop();
  const arrival = new Date("2026-08-05T08:10:00Z");
  const departure = new Date("2026-08-05T08:45:00Z");

  stop.recordArrival(arrival);
  assert.equal(stop.status, RouteStopStatus.InProgress);
  stop.recordDeparture(departure);

  assert.equal(stop.status, RouteStopStatus.Completed);
  assert.deepEqual(stop.actualArrivalAt, arrival);
  assert.deepEqual(stop.actualDepartureAt, departure);
  assert.notEqual(stop.actualArrivalAt, arrival);
  assert.notEqual(stop.actualDepartureAt, departure);
});

test("RouteStop protects its dates from external mutation", () => {
  const plannedArrival = new Date("2026-08-05T08:00:00Z");
  const stop = RouteStop.create({
    routeId: RouteId.generate(),
    shipmentId: ShipmentId.generate(),
    sequence: 1,
    operationType: RouteStopOperationType.Pickup,
    plannedArrivalAt: plannedArrival,
    plannedDepartureAt: new Date("2026-08-05T09:00:00Z"),
  });

  plannedArrival.setUTCFullYear(2030);
  const exposedArrival = stop.plannedArrivalAt;
  exposedArrival.setUTCFullYear(2031);

  assert.equal(stop.plannedArrivalAt.toISOString(), "2026-08-05T08:00:00.000Z");
});

test("RouteStop does not complete before an arrival", () => {
  const stop = createStop();
  assert.throws(
    () => stop.recordDeparture(new Date("2026-08-05T08:45:00Z")),
    /in-progress route stop/,
  );
});
