import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { Driver, DriverStatus } from '../../domain/driver.aggregate';
import { DriverMapper } from './driver.mapper';
import type { DriverEntity } from './entities/driver.entity';

const driverEntity: DriverEntity = {
  id: 'b6154da9-3b68-4fdc-aef2-3f9196a68f79',
  first_name: 'Alex',
  last_name: 'Doe',
  license_number: 'UA-DRIVER-001',
  depot_id: '514366f7-8429-4fc1-8cb1-4efb5c687ee1',
  phone_number: '+380501234567',
  status: 'AVAILABLE',
};

test('DriverMapper reconstitutes a driver from its persisted row', () => {
  const driver = DriverMapper.toDomain(driverEntity);

  assert.equal(driver.id.value, driverEntity.id);
  assert.equal(driver.firstName, driverEntity.first_name);
  assert.equal(driver.lastName, driverEntity.last_name);
  assert.equal(driver.licenseNumber, driverEntity.license_number);
  assert.equal(driver.depotId, driverEntity.depot_id);
  assert.equal(driver.phoneNumber, driverEntity.phone_number);
  assert.equal(driver.status, DriverStatus.Available);
});

test('DriverMapper maps absent nullable columns to undefined', () => {
  const driver = DriverMapper.toDomain({
    ...driverEntity,
    depot_id: null,
    phone_number: null,
  });

  assert.equal(driver.depotId, undefined);
  assert.equal(driver.phoneNumber, undefined);
});

test('DriverMapper derives a clean write model for a loaded driver', () => {
  const driver = DriverMapper.toDomain(driverEntity);

  const persistence = DriverMapper.toPersistence(driver);

  assert.equal(persistence.isNew, false);
  assert.deepEqual(persistence.root, {
    id: driverEntity.id,
    firstName: driverEntity.first_name,
    lastName: driverEntity.last_name,
    licenseNumber: driverEntity.license_number,
    depotId: driverEntity.depot_id,
    phoneNumber: driverEntity.phone_number,
    status: DriverStatus.Available,
  });
});

test('DriverMapper marks a registration as an insert', () => {
  const driver = Driver.register({
    firstName: 'Alex',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
  });

  const persistence = DriverMapper.toPersistence(driver);

  assert.equal(persistence.isNew, true);
  assert.equal(persistence.root.id, driver.id.value);
  assert.equal(persistence.root.status, DriverStatus.Available);
});

test('DriverMapper round-trips a driver through its persisted shape', () => {
  const original = Driver.register({
    firstName: 'Alex',
    lastName: 'Doe',
    licenseNumber: 'UA-DRIVER-001',
    depotId: 'DEPOT-1',
    phoneNumber: '+380501234567',
  });

  const persistence = DriverMapper.toPersistence(original);
  const entity: DriverEntity = {
    id: persistence.root.id,
    first_name: persistence.root.firstName,
    last_name: persistence.root.lastName,
    license_number: persistence.root.licenseNumber,
    depot_id: persistence.root.depotId ?? null,
    phone_number: persistence.root.phoneNumber ?? null,
    status: persistence.root.status,
  };

  const roundTripped = DriverMapper.toDomain(entity);

  assert.equal(roundTripped.id.value, original.id.value);
  assert.equal(roundTripped.firstName, original.firstName);
  assert.equal(roundTripped.lastName, original.lastName);
  assert.equal(roundTripped.licenseNumber, original.licenseNumber);
  assert.equal(roundTripped.depotId, original.depotId);
  assert.equal(roundTripped.phoneNumber, original.phoneNumber);
});
