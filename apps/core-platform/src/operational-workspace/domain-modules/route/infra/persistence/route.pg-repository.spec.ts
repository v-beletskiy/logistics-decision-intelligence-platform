import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PgDatabase } from '../../../../../shared/infra/persistence/pg-database';
import { Route, RouteStatus } from '../../domain/route.aggregate';
import { RouteId } from '../../domain/route-id';
import {
  RouteStop,
  RouteStopOperationType,
  RouteStopStatus,
} from '../../domain/route-stop.entity';
import { RouteStopId } from '../../domain/route-stop-id';
import { deleteRouteStops } from './queries/route.delete-stops.queries';
import { findRoutesByShipmentId } from './queries/route.find-by-shipment-id.queries';
import { insertRoute } from './queries/route.insert.queries';
import { insertRouteStops } from './queries/route.insert-stops.queries';
import { updateRoute } from './queries/route.update.queries';
import { updateRouteStops } from './queries/route.update-stops.queries';
import { PgRouteRepository } from './route.pg-repository';
import { ShipmentId } from '../../../shipment/domain/shipment-id';

const schedule = {
  arrivalTime: new Date('2026-08-06T08:00:00.000Z'),
  departureTime: new Date('2026-08-06T08:30:00.000Z'),
};

function trackedDatabase(): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

function loadPersistedRoute(): Route {
  const stops = [
    RouteStop.reconstitute(
      RouteStopId.from('00000000-0000-4000-8000-000000000011'),
      { shipmentId: '00000000-0000-4000-8000-000000000101', operationType: RouteStopOperationType.Pickup, status: RouteStopStatus.Planned, schedule },
    ),
    RouteStop.reconstitute(
      RouteStopId.from('00000000-0000-4000-8000-000000000012'),
      { shipmentId: '00000000-0000-4000-8000-000000000101', operationType: RouteStopOperationType.Delivery, status: RouteStopStatus.Planned, schedule },
    ),
  ];
  return Route.reconstitute(RouteId.from('00000000-0000-4000-8000-000000000001'), {
    stops,
    status: RouteStatus.Planned,
  });
}

test('save inserts the route and every stop on creation', async () => {
  const route = Route.create({
    stops: [
      { shipmentId: 's1', operationType: RouteStopOperationType.Pickup, schedule },
      { shipmentId: 's1', operationType: RouteStopOperationType.Delivery, schedule },
    ],
  });
  const { database, calls } = trackedDatabase();
  const repository = new PgRouteRepository(database);

  await repository.save(route);

  assert.equal(calls.filter((call) => call.statement === insertRoute).length, 1);
  assert.equal(calls.filter((call) => call.statement === updateRoute).length, 0);
  const insertCalls = calls.filter((call) => call.statement === insertRouteStops);
  assert.equal(insertCalls.length, 1);
  const rows = insertCalls[0]!.params as { rows: readonly unknown[] };
  assert.equal(rows.rows.length, 2);
  assert.equal(
    calls.filter((call) => call.statement === updateRouteStops).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteRouteStops).length,
    0,
  );
});

test('save updates the route and the changed stop when a stop starts', async () => {
  const route = loadPersistedRoute();
  route.start(true);
  route.startRouteStop(RouteStopId.from('00000000-0000-4000-8000-000000000011'));
  const { database, calls } = trackedDatabase();
  const repository = new PgRouteRepository(database);

  await repository.save(route);

  assert.equal(calls.filter((call) => call.statement === insertRoute).length, 0);
  assert.equal(calls.filter((call) => call.statement === updateRoute).length, 1);
  const updateCalls = calls.filter((call) => call.statement === updateRouteStops);
  assert.equal(updateCalls.length, 1);
  const rows = updateCalls[0]!.params as {
    rows: ReadonlyArray<{ id: string; status: string }>;
  };
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0]!.id, '00000000-0000-4000-8000-000000000011');
  assert.equal(rows.rows[0]!.status, RouteStopStatus.InProgress);
  assert.equal(
    calls.filter((call) => call.statement === insertRouteStops).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteRouteStops).length,
    0,
  );
});

test('save skips stop statements when only the route status changes', async () => {
  const route = loadPersistedRoute();
  route.start(true);
  const { database, calls } = trackedDatabase();
  const repository = new PgRouteRepository(database);

  await repository.save(route);

  assert.equal(calls.filter((call) => call.statement === updateRoute).length, 1);
  assert.equal(calls.filter((call) => call.statement === insertRoute).length, 0);
  assert.equal(
    calls.filter((call) => call.statement === insertRouteStops).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateRouteStops).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteRouteStops).length,
    0,
  );
  assert.equal(route.status, RouteStatus.InProgress);
});

test('findByShipmentId unwraps the shipment identifier only at the persistence boundary', async () => {
  const { database, calls } = trackedDatabase();
  const repository = new PgRouteRepository(database);
  const shipmentId = ShipmentId.from('00000000-0000-4000-8000-000000000101');

  const routes = await repository.findByShipmentId(shipmentId);

  assert.deepEqual(routes, []);
  assert.deepEqual(calls, [
    {
      statement: findRoutesByShipmentId,
      params: { shipmentId: shipmentId.value },
    },
  ]);
});
