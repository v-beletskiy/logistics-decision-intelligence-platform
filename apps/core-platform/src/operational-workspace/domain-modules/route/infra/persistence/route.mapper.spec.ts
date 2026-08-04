import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Route, RouteStatus } from "../../domain/route.aggregate";
import {
  RouteStopOperationType,
  RouteStopStatus,
} from "../../domain/route-stop.entity";
import { RouteStopId } from "../../domain/route-stop-id";
import { RouteMapper } from "./route.mapper";
import type { RouteEntity } from "./entities/route.entity";

const schedule = {
  arrivalTime: new Date("2026-08-06T08:00:00.000Z"),
  departureTime: new Date("2026-08-06T08:30:00.000Z"),
};

const routeRow: RouteEntity = {
  id: "b6154da9-3b68-4fdc-aef2-3f9196a68f79",
  status: RouteStatus.Planned,
  stops: [
    {
      id: "4e4bf6d6-5e06-4ba9-b8a3-5beb06b91898",
      shipmentId: "84f595f7-bbf0-4fc1-8cb1-4efb5c687ee1",
      operationType: RouteStopOperationType.Pickup,
      status: RouteStopStatus.Planned,
      arrivalTime: "2026-08-06T08:00:00.000Z",
      departureTime: "2026-08-06T08:30:00.000Z",
    },
    {
      id: "19f6c6f3-ca21-4d50-89cd-192cf75a8c64",
      shipmentId: "84f595f7-bbf0-4fc1-8cb1-4efb5c687ee1",
      operationType: RouteStopOperationType.Delivery,
      status: RouteStopStatus.Planned,
      arrivalTime: "2026-08-06T10:00:00.000Z",
      departureTime: "2026-08-06T10:30:00.000Z",
    },
  ],
};

test("RouteMapper reconstitutes a route from its JSON-aggregated stops", () => {
  const route = RouteMapper.toDomain(routeRow);

  assert.equal(route.id.value, routeRow.id);
  assert.deepEqual(
    route.stops.map((stop) => stop.id),
    routeRow.stops.map((stop) => stop.id),
  );
});

test("RouteMapper rejects malformed JSON-aggregated stops", () => {
  assert.throws(
    () =>
      RouteMapper.toDomain({
        ...routeRow,
        stops: {},
      } as unknown as RouteEntity),
    /must be a JSON array/,
  );
});

test("RouteMapper derives a clean write model for a loaded route", () => {
  const route = RouteMapper.toDomain(routeRow);

  const persistence = RouteMapper.toPersistence(route);

  assert.equal(persistence.isNew, false);
  assert.deepEqual(persistence.root, {
    id: routeRow.id,
    status: RouteStatus.Planned,
  });
  assert.equal(persistence.inserts.length, 0);
  assert.equal(persistence.updates.length, 0);
  assert.deepEqual(persistence.removedIds, []);
});

test("RouteMapper derives an insert row for every stop of a new route", () => {
  const route = Route.create({
    stops: [
      {
        shipmentId: "s1",
        operationType: RouteStopOperationType.Pickup,
        schedule,
      },
      {
        shipmentId: "s1",
        operationType: RouteStopOperationType.Delivery,
        schedule,
      },
    ],
  });

  const persistence = RouteMapper.toPersistence(route);

  assert.equal(persistence.isNew, true);
  assert.equal(persistence.inserts.length, 2);
  assert.equal(persistence.updates.length, 0);
  assert.deepEqual(persistence.removedIds, []);
  assert.equal(persistence.inserts[0]!.routeId, route.id.value);
  assert.equal(persistence.inserts[0]!.executionSequence, 1);
  assert.equal(
    persistence.inserts[0]!.operationType,
    RouteStopOperationType.Pickup,
  );
  assert.equal(persistence.inserts[1]!.executionSequence, 2);
});

test("RouteMapper derives update rows for started stops with their sequence", () => {
  const route = RouteMapper.toDomain(routeRow);
  route.start(true);
  route.startRouteStop(RouteStopId.from(routeRow.stops[0]!.id));

  const persistence = RouteMapper.toPersistence(route);

  assert.equal(persistence.isNew, false);
  assert.equal(persistence.inserts.length, 0);
  assert.equal(persistence.updates.length, 1);
  assert.deepEqual(persistence.updates[0], {
    id: routeRow.stops[0]!.id,
    shipmentId: routeRow.stops[0]!.shipmentId,
    operationType: RouteStopOperationType.Pickup,
    status: RouteStopStatus.InProgress,
    executionSequence: "1",
    arrivalTime: "2026-08-06T08:00:00.000Z",
    departureTime: "2026-08-06T08:30:00.000Z",
  });
});

test("RouteMapper round-trips a new route through its persisted shape", () => {
  const original = Route.create({
    stops: [
      {
        shipmentId: "s1",
        operationType: RouteStopOperationType.Pickup,
        schedule,
      },
      {
        shipmentId: "s1",
        operationType: RouteStopOperationType.Delivery,
        schedule,
      },
    ],
  });

  const persistence = RouteMapper.toPersistence(original);
  const entity: RouteEntity = {
    id: persistence.root.id,
    status: persistence.root.status,
    stops: persistence.inserts.map((row) => ({
      id: row.id!,
      shipmentId: row.shipmentId!,
      operationType: row.operationType!,
      status: row.status!,
      arrivalTime: (row.arrivalTime as Date).toISOString(),
      departureTime: (row.departureTime as Date).toISOString(),
    })),
  };

  const roundTripped = RouteMapper.toDomain(entity);

  assert.equal(roundTripped.id.value, original.id.value);
  assert.equal(roundTripped.status, original.status);
  assert.equal(roundTripped.stops.length, original.stops.length);
  assert.deepEqual(
    roundTripped.stops.map((stop) => stop.id),
    original.stops.map((stop) => stop.id),
  );
});
