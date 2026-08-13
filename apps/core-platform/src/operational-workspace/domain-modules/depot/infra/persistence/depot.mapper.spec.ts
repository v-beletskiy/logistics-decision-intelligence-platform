import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../../shared/domain/shared-kernel/value-objects/location/address";

import { Depot, DepotStatus } from "../../domain/depot.aggregate";
import { DepotMapper, type DepotPersistenceRow } from "./depot.mapper";

const tenantId = "00000000-0000-4000-8000-000000000099";

const address: AddressProps = {
  country: "UA",
  stateOrRegion: "Kyiv Oblast",
  city: "Kyiv",
  street: "Halytska",
  buildingNumber: "12",
  postalCode: "02000",
};

const depotEntity: DepotPersistenceRow = {
  id: "b6154da9-3b68-4fdc-aef2-3f9196a68f79",
  name: "Kyiv Hub",
  country: "UA",
  state_or_region: "Kyiv Oblast",
  city: "Kyiv",
  street: "Halytska",
  building_number: "12",
  postal_code: "02000",
  status: "ACTIVE",
  vehicle_capacity: 30,
  driver_capacity: 20,
  vehicle_count: 12,
  driver_count: 7,
};

test("DepotMapper reconstitutes a depot from its persisted row", () => {
  const depot = DepotMapper.toDomain(depotEntity);

  assert.equal(depot.id.value, depotEntity.id);
  assert.equal(depot.name, depotEntity.name);
  assert.equal(depot.address.country, depotEntity.country);
  assert.equal(depot.address.stateOrRegion, depotEntity.state_or_region);
  assert.equal(depot.address.city, depotEntity.city);
  assert.equal(depot.address.street, depotEntity.street);
  assert.equal(depot.address.buildingNumber, depotEntity.building_number);
  assert.equal(depot.address.postalCode, depotEntity.postal_code);
  assert.equal(depot.status, DepotStatus.Active);
  assert.equal(depot.vehicleCapacity, depotEntity.vehicle_capacity);
  assert.equal(depot.driverCapacity, depotEntity.driver_capacity);
  assert.equal(depot.vehicleCount, depotEntity.vehicle_count);
  assert.equal(depot.driverCount, depotEntity.driver_count);
});

test("DepotMapper maps absent nullable address columns to undefined", () => {
  const depot = DepotMapper.toDomain({
    ...depotEntity,
    state_or_region: null,
  });

  assert.equal(depot.address.stateOrRegion, undefined);
});

test("DepotMapper derives a clean write model for a loaded depot", () => {
  const depot = DepotMapper.toDomain(depotEntity);

  const persistence = DepotMapper.toPersistence(tenantId, depot);

  assert.equal(persistence.isNew, false);
  assert.deepEqual(persistence.root, {
    tenantId,
    id: depotEntity.id,
    name: depotEntity.name,
    country: depotEntity.country,
    stateOrRegion: depotEntity.state_or_region,
    city: depotEntity.city,
    street: depotEntity.street,
    buildingNumber: depotEntity.building_number,
    postalCode: depotEntity.postal_code,
    status: DepotStatus.Active,
    vehicleCapacity: depotEntity.vehicle_capacity,
    driverCapacity: depotEntity.driver_capacity,
    vehicleCount: depotEntity.vehicle_count,
    driverCount: depotEntity.driver_count,
  });
});

test("DepotMapper marks a registration as an insert", () => {
  const depot = Depot.create({ name: "Kyiv Hub", address }, 30, 20);

  const persistence = DepotMapper.toPersistence(tenantId, depot);

  assert.equal(persistence.isNew, true);
  assert.equal(persistence.root.id, depot.id.value);
  assert.equal(persistence.root.status, DepotStatus.Active);
  assert.equal(persistence.root.vehicleCount, 0);
  assert.equal(persistence.root.driverCount, 0);
});

test("DepotMapper round-trips a depot through its persisted shape", () => {
  const original = Depot.create({ name: "Kyiv Hub", address }, 30, 20);
  original.receiveVehicle();
  original.receiveDriver();

  const persistence = DepotMapper.toPersistence(tenantId, original);
  const entity: DepotPersistenceRow = {
    id: persistence.root.id,
    name: persistence.root.name,
    country: persistence.root.country,
    state_or_region: persistence.root.stateOrRegion ?? null,
    city: persistence.root.city,
    street: persistence.root.street,
    building_number: persistence.root.buildingNumber,
    postal_code: persistence.root.postalCode,
    status: persistence.root.status,
    vehicle_capacity: persistence.root.vehicleCapacity,
    driver_capacity: persistence.root.driverCapacity,
    vehicle_count: persistence.root.vehicleCount,
    driver_count: persistence.root.driverCount,
  };

  const roundTripped = DepotMapper.toDomain(entity);

  assert.equal(roundTripped.id.value, original.id.value);
  assert.equal(roundTripped.name, original.name);
  assert.equal(roundTripped.address.city, original.address.city);
  assert.equal(roundTripped.status, original.status);
  assert.equal(roundTripped.vehicleCapacity, original.vehicleCapacity);
  assert.equal(roundTripped.driverCapacity, original.driverCapacity);
  assert.equal(roundTripped.vehicleCount, original.vehicleCount);
  assert.equal(roundTripped.driverCount, original.driverCount);
});
