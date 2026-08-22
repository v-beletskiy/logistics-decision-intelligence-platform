import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../shared/domain/value-objects/measurement";
import {
  Compartment,
  CompartmentType,
  Vehicle,
  VehicleStatus,
} from "./vehicle.aggregate";
import { VehicleId } from "./vehicle-id";

const details = {
  registrationNumber: "AA-1234-BB",
  compartments: [
    {
      type: CompartmentType.DryCargo,
      capacity: {
        maxWeight: { value: 1_000, unit: WeightUnit.Kilogram },
        maxItemDimensions: {
          length: 400,
          width: 200,
          height: 200,
          unit: DimensionUnit.Centimeter,
        },
        maxVolume: { value: 30, unit: VolumeUnit.CubicMeter },
      },
    },
  ],
};

test("Vehicle enforces compartment capacities and maintenance transitions", () => {
  assert.throws(
    () =>
      Vehicle.register({
        ...details,
        compartments: [
          {
            ...details.compartments[0],
            capacity: {
              ...details.compartments[0].capacity,
              maxWeight: { value: -1, unit: WeightUnit.Kilogram },
            },
          },
        ],
      }),
    /cannot be negative/,
  );

  const vehicle = Vehicle.register(details);
  const compartmentId = vehicle.compartments[0]!.id;
  vehicle.updateDetails({
    registrationNumber: "BB-9876-AA",
    name: "Updated vehicle",
  });
  assert.equal(vehicle.compartments[0]!.id.value, compartmentId.value);
  vehicle.sendToMaintenance();
  assert.equal(vehicle.status, VehicleStatus.Maintenance);
  assert.throws(() => vehicle.markAvailable(), /returned from maintenance/);
  vehicle.returnFromMaintenance();
  vehicle.decommission();
  assert.equal(vehicle.status, VehicleStatus.Decommissioned);
  assert.throws(
    () => vehicle.updateDetails({ registrationNumber: "BB-9876-AA" }),
    /decommissioned vehicle/,
  );
});

test("Vehicle manages compartments as stable child entities", () => {
  const vehicle = Vehicle.register(details);
  const existingId = vehicle.compartments[0]!.id;
  const addedId = vehicle.addCompartment({
    type: CompartmentType.Refrigerated,
    name: "Cold cargo",
    capacity: details.compartments[0]!.capacity,
  });

  vehicle.updateCompartment(addedId, {
    type: CompartmentType.Frozen,
    name: "Frozen cargo",
    capacity: details.compartments[0]!.capacity,
  });

  assert.deepEqual(
    vehicle.compartments.map((compartment) => compartment.id.value),
    [existingId.value, addedId.value],
  );
  assert.equal(vehicle.compartments[1]!.type, CompartmentType.Frozen);

  vehicle.removeCompartment(addedId);
  assert.deepEqual(
    vehicle.compartments.map((compartment) => compartment.id.value),
    [existingId.value],
  );
  assert.throws(
    () => vehicle.removeCompartment(existingId),
    /at least one compartment/,
  );
});

test("Vehicle bounds its aggregate-owned compartment set", () => {
  const vehicle = Vehicle.register(details);
  for (let index = 0; index < 4; index += 1) {
    vehicle.addCompartment({
      type: CompartmentType.DryCargo,
      capacity: details.compartments[0]!.capacity,
    });
  }

  assert.throws(
    () =>
      vehicle.addCompartment({
        type: CompartmentType.DryCargo,
        capacity: details.compartments[0]!.capacity,
      }),
    /cannot contain more than 5 compartments/,
  );
});

test("Vehicle rejects unsupported compartment types and statuses", () => {
  assert.throws(
    () =>
      Vehicle.register({
        ...details,
        compartments: [
          { ...details.compartments[0], type: "UNKNOWN" as CompartmentType },
        ],
      }),
    /valid compartment type/,
  );

  assert.throws(
    () =>
      Vehicle.reconstitute(VehicleId.generate(), {
        ...details,
        compartments: [Compartment.create(details.compartments[0])],
        status: "UNKNOWN" as VehicleStatus,
      }),
    /vehicle status is invalid/,
  );
});

test("Vehicle validates required and optional text values at runtime", () => {
  assert.throws(
    () =>
      Vehicle.register({
        ...details,
        registrationNumber: 42 as unknown as string,
      }),
    /Vehicle registration number must be text/,
  );
  assert.throws(
    () => Vehicle.register({ ...details, name: 42 as unknown as string }),
    /Vehicle name must be text when specified/,
  );
  assert.throws(
    () =>
      Vehicle.register({
        ...details,
        compartments: [
          { ...details.compartments[0], name: 42 as unknown as string },
        ],
      }),
    /Compartment name must be text when specified/,
  );
});
