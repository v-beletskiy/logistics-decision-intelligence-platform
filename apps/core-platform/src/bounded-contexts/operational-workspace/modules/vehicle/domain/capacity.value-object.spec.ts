import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../shared/domain/value-objects/measurement";

import { Capacity } from "./capacity.value-object";

const validProps = {
  maxWeight: { value: 1_000, unit: WeightUnit.Kilogram },
  maxItemDimensions: {
    length: 400,
    width: 200,
    height: 200,
    unit: DimensionUnit.Centimeter,
  },
  maxVolume: { value: 30, unit: VolumeUnit.CubicMeter },
};

test("Capacity owns validation and creates immutable measurement value objects", () => {
  assert.throws(
    () =>
      Capacity.create({
        ...validProps,
        maxWeight: { value: -1, unit: WeightUnit.Kilogram },
      }),
    /Weight value cannot be negative/,
  );
  assert.throws(
    () =>
      Capacity.create({
        ...validProps,
        maxItemDimensions: {
          ...validProps.maxItemDimensions,
          width: 0,
        },
      }),
    /Dimension width must be greater than zero/,
  );

  const capacity = Capacity.create(validProps);
  assert.ok(Object.isFrozen(capacity));
  assert.ok(Object.isFrozen(capacity.maxWeight));
  assert.ok(capacity.equals(Capacity.create(validProps)));
});
