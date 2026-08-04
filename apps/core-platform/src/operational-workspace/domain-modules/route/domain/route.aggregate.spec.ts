import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Route, RouteStatus } from "./route.aggregate";
import { RouteId } from "./route-id";
import { RouteStopId } from "./route-stop-id";
import {
  RouteStop,
  RouteStopOperationType,
  RouteStopStatus,
} from "./route-stop.entity";

const schedule = {
  arrivalTime: new Date("2026-08-05T08:00:00.000Z"),
  departureTime: new Date("2026-08-05T09:00:00.000Z"),
};

function validStops() {
  return [
    {
      shipmentId: "shipment-1",
      operationType: RouteStopOperationType.Pickup,
      schedule,
    },
    {
      shipmentId: "shipment-1",
      operationType: RouteStopOperationType.Delivery,
      schedule,
    },
  ];
}

test("Route protects pickup-before-delivery and all shipment stops", () => {
  assert.throws(
    () => Route.create({ stops: [...validStops()].reverse() }),
    /must precede its delivery/,
  );
  assert.throws(
    () => Route.create({ stops: [validStops()[0]] }),
    /at least one pickup and one delivery/,
  );
});

test("Route requires a running assignment and completed sequential stops", () => {
  const route = Route.create({ stops: validStops() });
  assert.throws(() => route.start(false), /requires a running assignment/);

  route.start(true);
  const [pickup, delivery] = route.stops;
  route.startRouteStop(RouteStopId.from(pickup.id));
  assert.equal(route.stops[0].status, RouteStopStatus.InProgress);
  assert.throws(
    () => route.startRouteStop(RouteStopId.from(delivery.id)),
    /must be executed in sequence/,
  );
  route.completeStop(RouteStopId.from(pickup.id));
  route.startRouteStop(RouteStopId.from(delivery.id));
  route.completeStop(RouteStopId.from(delivery.id));
  route.complete();

  assert.equal(route.status, "COMPLETED");
  assert.deepEqual(
    route.pullDomainEvents().map((event) => event.type),
    [
      "RouteCreatedDomainEvent",
      "RouteStartedDomainEvent",
      "RouteCompletedDomainEvent",
    ],
  );
});

test("Route exposes stop snapshots rather than mutable route-stop entities", () => {
  const route = Route.create({ stops: validStops() });
  const stop = route.stops[0];
  stop.schedule.arrivalTime.setUTCFullYear(1999);

  assert.equal(route.stops[0].schedule.arrivalTime.getUTCFullYear(), 2026);
  assert.equal("start" in stop, false);
});

test("Route rejects unsupported statuses and route-stop classifications", () => {
  assert.throws(
    () =>
      RouteStop.reconstitute(RouteStopId.generate(), {
        ...validStops()[0],
        status: RouteStopStatus.Planned,
        operationType: "UNKNOWN" as RouteStopOperationType,
      }),
    /operation type must be specified/,
  );
  assert.throws(
    () =>
      RouteStop.reconstitute(RouteStopId.generate(), {
        ...validStops()[0],
        status: "UNKNOWN" as RouteStopStatus,
      }),
    /route stop status is invalid/,
  );
  assert.throws(
    () =>
      Route.reconstitute(RouteId.generate(), {
        stops: validStops().map((stop) => RouteStop.create(stop)),
        status: "UNKNOWN" as RouteStatus,
      }),
    /route status is invalid/,
  );
});

test("Route validates route-stop text values at runtime", () => {
  assert.throws(
    () =>
      Route.create({
        stops: [
          { ...validStops()[0], shipmentId: 42 as unknown as string },
          validStops()[1],
        ],
      }),
    /A route stop shipment must be text/,
  );
});

test("Route persistence plan marks a creation as new and a reconstitution as loaded", () => {
  assert.equal(
    Route.create({ stops: validStops() }).getPersistencePlan().isNew,
    true,
  );
  assert.equal(
    Route.reconstitute(RouteId.from("00000000-0000-4000-8000-000000000001"), {
      stops: validStops().map((stop) =>
        RouteStop.reconstitute(RouteStopId.generate(), {
          ...stop,
          status: RouteStopStatus.Planned,
        }),
      ),
      status: RouteStatus.Planned,
    }).getPersistencePlan().isNew,
    false,
  );
});

test("Route persistence plan tracks new stops as inserts and touched stops as updates", () => {
  const created = Route.create({ stops: validStops() });
  assert.equal(created.getPersistencePlan().stops.inserts.length, 2);
  assert.equal(created.getPersistencePlan().stops.updates.length, 0);

  const stops = validStops().map((stop) =>
    RouteStop.reconstitute(RouteStopId.generate(), {
      ...stop,
      status: RouteStopStatus.Planned,
    }),
  );
  const loaded = Route.reconstitute(RouteId.generate(), {
    stops,
    status: RouteStatus.Planned,
  });
  assert.equal(loaded.getPersistencePlan().stops.inserts.length, 0);
  assert.equal(loaded.getPersistencePlan().stops.updates.length, 0);

  loaded.start(true);
  loaded.startRouteStop(stops[0]!.id);
  assert.equal(loaded.getPersistencePlan().stops.updates.length, 1);
  assert.equal(
    loaded.getPersistencePlan().stops.updates[0]!.id.value,
    stops[0]!.id.value,
  );
  assert.equal(
    loaded.getPersistencePlan().stops.updates[0]!.status,
    RouteStopStatus.InProgress,
  );
});
