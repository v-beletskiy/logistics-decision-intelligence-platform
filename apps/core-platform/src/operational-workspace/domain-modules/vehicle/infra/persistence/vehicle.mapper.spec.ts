import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  CompartmentType,
  Vehicle,
  VehicleStatus,
} from "../../domain/vehicle.aggregate";
import { DimensionUnit, VolumeUnit, WeightUnit } from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import {
  VehicleMapper,
  type VehiclePersistenceRow,
} from "./vehicle.mapper";

const tenantId = "00000000-0000-4000-8000-000000000099";

const capacity = {
  maxWeight: { value: 1_000, unit: WeightUnit.Kilogram },
  maxItemDimensions: {
    length: 400,
    width: 200,
    height: 200,
    unit: DimensionUnit.Centimeter,
  },
  maxVolume: { value: 30, unit: VolumeUnit.CubicMeter },
};

const vehicleEntity = {
  id: "b6154da9-3b68-4fdc-aef2-3f9196a68f79",
  registration_number: "AA-1234-BB",
  name: "Refrigerated trailer",
  depot_id: "514366f7-8429-4fc1-8cb1-4efb5c687ee1",
  status: "AVAILABLE",
  compartments: [
    {
      id: "4e4bf6d6-5e06-4ba9-b8a3-5beb06b91898",
      type: "REFRIGERATED",
      name: "Chilled cargo",
      max_weight: 1_000,
      max_weight_unit: "KILOGRAM",
      max_length: 400,
      max_width: 200,
      max_height: 200,
      dimension_unit: "CENTIMETER",
      max_volume: 30,
      max_volume_unit: "CUBIC_METER",
    },
  ],
} satisfies VehiclePersistenceRow;

test("VehicleMapper reconstitutes a vehicle from its JSON-aggregated compartments", () => {
  const vehicle = VehicleMapper.toDomain(vehicleEntity);

  assert.equal(vehicle.id.value, vehicleEntity.id);
  assert.equal(vehicle.registrationNumber, vehicleEntity.registration_number);
  assert.equal(vehicle.compartments.length, 1);
  assert.equal(
    vehicle.compartments[0]?.id.value,
    vehicleEntity.compartments[0]?.id,
  );
  assert.equal(vehicle.compartments[0]?.capacity.maxVolume.value, 30);
});

test("VehicleMapper rejects a non-array compartments column", () => {
  assert.throws(
    () =>
      VehicleMapper.toDomain({
        ...vehicleEntity,
        compartments: {},
      }),
    /must be a JSON array/,
  );
});

test("VehicleMapper derives a clean write model for a loaded vehicle", () => {
  const vehicle = VehicleMapper.toDomain(vehicleEntity);

  const persistence = VehicleMapper.toPersistence(tenantId, vehicle);

  assert.equal(persistence.isNew, false);
  assert.deepEqual(persistence.root, {
    tenantId,
    id: vehicleEntity.id,
    registrationNumber: vehicleEntity.registration_number,
    name: vehicleEntity.name,
    depotId: vehicleEntity.depot_id,
    status: VehicleStatus.Available,
  });
  assert.equal(persistence.inserts.length, 0);
  assert.equal(persistence.updates.length, 0);
  assert.deepEqual(persistence.removedIds, []);
});

test("VehicleMapper derives an insert row for every compartment of a new vehicle", () => {
  const vehicle = Vehicle.register({
    registrationNumber: "AA-1234-BB",
    compartments: [
      { type: CompartmentType.DryCargo, capacity },
      { type: CompartmentType.Refrigerated, name: "Cold cargo", capacity },
    ],
  });

  const persistence = VehicleMapper.toPersistence(tenantId, vehicle);

  assert.equal(persistence.isNew, true);
  assert.equal(persistence.inserts.length, 2);
  assert.equal(persistence.inserts[0]!.tenantId, tenantId);
  assert.equal(persistence.updates.length, 0);
  assert.deepEqual(persistence.removedIds, []);
  assert.equal(persistence.inserts[0]!.vehicleId, vehicle.id.value);
  assert.equal(persistence.inserts[0]!.type, CompartmentType.DryCargo);
  assert.equal(persistence.inserts[1]!.name, "Cold cargo");
});

test("VehicleMapper derives update and removal rows for changed compartments", () => {
  const vehicle = VehicleMapper.toDomain(vehicleEntity);
  const existing = vehicle.compartments[0]!.id;
  vehicle.updateCompartment(existing, {
    type: CompartmentType.Frozen,
    name: "Frozen cargo",
    capacity,
  });
  const removed = vehicle.addCompartment({
    type: CompartmentType.DryCargo,
    capacity,
  });
  vehicle.removeCompartment(removed);

  const persistence = VehicleMapper.toPersistence(tenantId, vehicle);

  assert.equal(persistence.isNew, false);
  assert.equal(persistence.inserts.length, 0);
  assert.equal(persistence.updates.length, 1);
  assert.deepEqual(persistence.updates[0], {
    id: existing.value,
    type: CompartmentType.Frozen,
    name: "Frozen cargo",
    maxWeight: "1000",
    maxWeightUnit: WeightUnit.Kilogram,
    maxLength: "400",
    maxWidth: "200",
    maxHeight: "200",
    dimensionUnit: DimensionUnit.Centimeter,
    maxVolume: "30",
    maxVolumeUnit: VolumeUnit.CubicMeter,
  });
  assert.deepEqual(persistence.removedIds, [removed.value]);
});

test("VehicleMapper round-trips a new vehicle through its persisted shape", () => {
  const original = Vehicle.register({
    registrationNumber: "AA-1234-BB",
    name: "Refrigerated trailer",
    depotId: "DEPOT-1",
    compartments: [
      { type: CompartmentType.DryCargo, name: "Main hold", capacity },
      { type: CompartmentType.Refrigerated, capacity },
    ],
  });

  const persistence = VehicleMapper.toPersistence(tenantId, original);
  const entity: VehiclePersistenceRow = {
    id: persistence.root.id,
    registration_number: persistence.root.registrationNumber,
    name: persistence.root.name ?? null,
    depot_id: persistence.root.depotId ?? null,
    status: persistence.root.status,
    compartments: persistence.inserts.map((row) => ({
      id: row.id!,
      type: row.type!,
      name: row.name ?? null,
      max_weight: row.maxWeight!,
      max_weight_unit: row.maxWeightUnit!,
      max_length: row.maxLength!,
      max_width: row.maxWidth!,
      max_height: row.maxHeight!,
      dimension_unit: row.dimensionUnit!,
      max_volume: row.maxVolume!,
      max_volume_unit: row.maxVolumeUnit!,
    })),
  };

  const roundTripped = VehicleMapper.toDomain(entity);

  assert.equal(roundTripped.id.value, original.id.value);
  assert.equal(roundTripped.registrationNumber, original.registrationNumber);
  assert.equal(roundTripped.name, original.name);
  assert.equal(roundTripped.depotId, original.depotId);
  assert.equal(roundTripped.compartments.length, original.compartments.length);
  assert.ok(roundTripped.compartments[0]!.equals(original.compartments[0]!));
  assert.ok(roundTripped.compartments[1]!.equals(original.compartments[1]!));
});
