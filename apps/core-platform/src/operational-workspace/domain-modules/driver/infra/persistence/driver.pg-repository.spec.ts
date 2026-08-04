import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PgDatabase } from '../../../../../shared/infra/persistence/pg-database';
import { Driver, DriverStatus } from '../../domain/driver.aggregate';
import { DriverId } from '../../domain/driver-id';
import { insertDriver } from './queries/driver.insert.queries';
import { updateDriver } from './queries/driver.update.queries';
import { PgDriverRepository } from './driver.pg-repository';

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

function loadPersistedDriver(): Driver {
  return Driver.reconstitute(DriverId.from('00000000-0000-4000-8000-000000000001'), {
    firstName: 'Alex',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
    depotId: '514366f7-8429-4fc1-8cb1-4efb5c687ee1',
    phoneNumber: '+380501234567',
    status: DriverStatus.Available,
  });
}

test('save inserts the driver row on registration', async () => {
  const driver = Driver.register({
    firstName: 'Alex',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
  });
  const { database, calls } = trackedDatabase();
  const repository = new PgDriverRepository(database);

  await repository.save(driver);

  assert.equal(calls.filter((call) => call.statement === insertDriver).length, 1);
  assert.equal(calls.filter((call) => call.statement === updateDriver).length, 0);
  const insert = calls.find((call) => call.statement === insertDriver);
  assert.deepEqual(insert!.params, {
    id: driver.id.value,
    firstName: 'Alex',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
    depotId: undefined,
    phoneNumber: undefined,
    status: DriverStatus.Available,
  });
});

test('save updates the driver row when a loaded driver changes', async () => {
  const driver = loadPersistedDriver();
  driver.markUnavailable();
  const { database, calls } = trackedDatabase();
  const repository = new PgDriverRepository(database);

  await repository.save(driver);

  assert.equal(calls.filter((call) => call.statement === insertDriver).length, 0);
  assert.equal(calls.filter((call) => call.statement === updateDriver).length, 1);
  const update = calls.find((call) => call.statement === updateDriver);
  assert.deepEqual(update!.params, {
    id: driver.id.value,
    firstName: 'Alex',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
    depotId: '514366f7-8429-4fc1-8cb1-4efb5c687ee1',
    phoneNumber: '+380501234567',
    status: DriverStatus.Unavailable,
  });
});

test('save updates the driver row after details change', async () => {
  const driver = loadPersistedDriver();
  driver.updateDetails({
    firstName: 'Alexandra',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
  });
  const { database, calls } = trackedDatabase();
  const repository = new PgDriverRepository(database);

  await repository.save(driver);

  const update = calls.find((call) => call.statement === updateDriver);
  const params = update!.params as {
    firstName: string;
    depotId: string | undefined;
    phoneNumber: string | undefined;
  };
  assert.equal(params.firstName, 'Alexandra');
  assert.equal(params.depotId, undefined);
  assert.equal(params.phoneNumber, undefined);
});
