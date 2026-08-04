import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PgDatabase } from '../../../../../shared/infra/persistence/pg-database';
import {
  Route,
  RouteStatus,
  RouteStop,
  RouteStopOperationType,
  RouteStopStatus,
} from '../../domain/route.aggregate';
import { RouteId, RouteStopId } from '../../domain/route-id';
import { deleteRouteStops } from './queries/route.delete-stops.queries';
import { insertRoute } from './queries/route.insert.queries';
import { insertRouteStops } from './queries/route.insert-stops.queries';
import { updateRoute } from './queries/route.update.queries';
import { updateRouteStops } from './queries/route.update-stops.queries';
import { PgRouteRepository } from './route.pg-repository';

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

function loadPersistedMultiShipmentRoute(): Route {
  const stops = [
    RouteStop.reconstitute(
      RouteStopId.from('00000000-0000-4000-8000-000000000011'),
      { shipmentId: '00000000-0000-4000-8000-000000000101', operationType: RouteStopOperationType.Pickup, status: RouteStopStatus.Planned, schedule },
    ),
    RouteStop.reconstitute(
      RouteStopId.from('00000000-0000-4000-8000-000000000012'),
      { shipmentId: '00000000-0000-4000-8000-000000000101', operationType: RouteStopOperationType.Delivery, status: RouteStopStatus.Planned, schedule },
    ),
    RouteStop.reconstitute(
      RouteStopId.from('00000000-0000-4000-8000-000000000013'),
      { shipmentId: '00000000-0000-4000-8000-000000000102', operationType: RouteStopOperationType.Pickup, status: RouteStopStatus.Planned, schedule },
    ),
    RouteStop.reconstitute(
      RouteStopId.from('00000000-0000-4000-8000-000000000014'),
      { shipmentId: '00000000-0000-4000-8000-000000000102', operationType: RouteStopOperationType.Delivery, status: RouteStopStatus.Planned, schedule },
    ),
  ];
  return Route.reconstitute(RouteId.from('00000000-0000-4000-8000-000000000001'), {
    stops,
    status: RouteStatus.Planned,
  });
}

test('save updates the route and every moved stop after a reorder', async () => {
  const route = loadPersistedMultiShipmentRoute();
  route.reorderStops(
    [
      RouteStopId.from('00000000-0000-4000-8000-000000000013'),
      RouteStopId.from('00000000-0000-4000-8000-000000000014'),
      RouteStopId.from('00000000-0000-4000-8000-000000000011'),
      RouteStopId.from('00000000-0000-4000-8000-000000000012'),
    ],
    false,
  );
  const { database, calls } = trackedDatabase();
  const repository = new PgRouteRepository(database);

  await repository.save(route);

  const updateCalls = calls.filter((call) => call.statement === updateRouteStops);
  assert.equal(updateCalls.length, 1);
  const rows = updateCalls[0]!.params as {
    rows: ReadonlyArray<{ id: string; executionSequence: string }>;
  };
  assert.equal(rows.rows.length, 4);
  assert.equal(rows.rows[0]!.id, '00000000-0000-4000-8000-000000000013');
  assert.equal(rows.rows[0]!.executionSequence, '1');
  assert.equal(rows.rows[1]!.id, '00000000-0000-4000-8000-000000000014');
  assert.equal(rows.rows[1]!.executionSequence, '2');
  assert.equal(rows.rows[2]!.id, '00000000-0000-4000-8000-000000000011');
  assert.equal(rows.rows[2]!.executionSequence, '3');
  assert.equal(rows.rows[3]!.id, '00000000-0000-4000-8000-000000000012');
  assert.equal(rows.rows[3]!.executionSequence, '4');
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
