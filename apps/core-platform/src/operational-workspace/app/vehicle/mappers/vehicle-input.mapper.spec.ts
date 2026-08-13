import * as assert from "node:assert/strict";
import { test } from "node:test";

import { CompartmentType } from "../../../domain-modules/vehicle/domain/compartment.entity";
import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import { VehicleInputMapper } from "./vehicle-input.mapper";

test("VehicleInputMapper converts application values into domain details", () => {
  const details = VehicleInputMapper.toRegistrationDetails({
    registrationNumber: "AA-1234-BB",
    depotId: "550e8400-e29b-41d4-a716-446655440000",
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
  });

  assert.equal(details.depotId?.value, "550e8400-e29b-41d4-a716-446655440000");
  assert.equal(details.compartments[0]?.type, CompartmentType.DryCargo);
  assert.equal(
    details.compartments[0]?.capacity.maxWeight.unit,
    WeightUnit.Kilogram,
  );
});
