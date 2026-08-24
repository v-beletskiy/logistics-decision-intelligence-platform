import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../../shared/domain/value-objects/measurement/index.js";
import { CompartmentType } from "../../domain/compartment.entity.js";
import type { RegisterVehicleRequest } from "./vehicle.http-contracts.js";
import { VehicleHttpMapper } from "./vehicle.http-mapper.js";

const request: RegisterVehicleRequest = {
  registrationNumber: "AA1234BC",
  name: "Truck 1",
  compartments: [
    {
      type: CompartmentType.DryCargo,
      name: "Main",
      capacity: {
        maxWeight: { value: 2000, unit: WeightUnit.Kilogram },
        maxItemDimensions: {
          length: 3,
          width: 3,
          height: 3,
          unit: DimensionUnit.Meter,
        },
        maxVolume: { value: 20, unit: VolumeUnit.CubicMeter },
      },
    },
  ],
};

test("VehicleHttpMapper converts a register request into a registration input", () => {
  const input = VehicleHttpMapper.toRegisterVehicleInput(request);

  assert.equal(input.registrationNumber, "AA1234BC");
  assert.equal(input.name, "Truck 1");
  assert.equal(input.compartments.length, 1);
  assert.equal(input.compartments[0].type, CompartmentType.DryCargo);
  assert.deepEqual(input.compartments[0].capacity.maxWeight, {
    value: 2000,
    unit: "KILOGRAM",
  });
});

test("VehicleHttpMapper maps a created vehicle response", () => {
  assert.deepEqual(VehicleHttpMapper.toCreatedVehicleResponse("vehicle-id"), {
    id: "vehicle-id",
  });
});
