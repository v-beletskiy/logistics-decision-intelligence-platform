import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  Dimensions,
  DimensionUnit,
  Distance,
  DistanceUnit,
  Volume,
  VolumeUnit,
  Weight,
  WeightUnit,
} from '.';

test('Weight validates its value and unit and compares by value', () => {
  const weight = Weight.create({ value: 0, unit: WeightUnit.Kilogram });

  assert.ok(weight.equals(Weight.create({ value: 0, unit: WeightUnit.Kilogram })));
  assert.ok(!weight.equals(Weight.create({ value: 0, unit: WeightUnit.Gram })));
  assert.ok(Object.isFrozen(weight));
  assert.throws(
    () => Weight.create({ value: -1, unit: WeightUnit.Kilogram }),
    /cannot be negative/,
  );
  assert.throws(
    () => Weight.create({ value: 1, unit: 'UNKNOWN' as WeightUnit }),
    /Weight unit is invalid/,
  );
});

test('Volume validates its value and unit and compares by value', () => {
  const volume = Volume.create({ value: 0, unit: VolumeUnit.CubicMeter });

  assert.ok(volume.equals(Volume.create({ value: 0, unit: VolumeUnit.CubicMeter })));
  assert.ok(!volume.equals(Volume.create({ value: 1, unit: VolumeUnit.CubicMeter })));
  assert.ok(Object.isFrozen(volume));
  assert.throws(
    () => Volume.create({ value: Number.POSITIVE_INFINITY, unit: VolumeUnit.Liter }),
    /must be a finite number/,
  );
  assert.throws(
    () => Volume.create({ value: 1, unit: 'UNKNOWN' as VolumeUnit }),
    /Volume unit is invalid/,
  );
});

test('Distance validates its value and unit and compares by value', () => {
  const distance = Distance.create({ value: 0, unit: DistanceUnit.Kilometer });

  assert.ok(distance.equals(Distance.create({ value: 0, unit: DistanceUnit.Kilometer })));
  assert.ok(!distance.equals(Distance.create({ value: 0, unit: DistanceUnit.Mile })));
  assert.ok(Object.isFrozen(distance));
  assert.throws(
    () => Distance.create({ value: -1, unit: DistanceUnit.Kilometer }),
    /cannot be negative/,
  );
  assert.throws(
    () => Distance.create({ value: 1, unit: 'UNKNOWN' as DistanceUnit }),
    /Distance unit is invalid/,
  );
});

test('Dimensions requires positive finite measurements and a valid unit', () => {
  const dimensions = Dimensions.create({
    length: 100,
    width: 50,
    height: 25,
    unit: DimensionUnit.Centimeter,
  });

  assert.ok(dimensions.equals(Dimensions.create({
    length: 100,
    width: 50,
    height: 25,
    unit: DimensionUnit.Centimeter,
  })));
  assert.ok(Object.isFrozen(dimensions));
  assert.throws(
    () => Dimensions.create({
      length: 0,
      width: 50,
      height: 25,
      unit: DimensionUnit.Centimeter,
    }),
    /Dimension length must be greater than zero/,
  );
  assert.throws(
    () => Dimensions.create({
      length: 100,
      width: Number.NaN,
      height: 25,
      unit: DimensionUnit.Centimeter,
    }),
    /Dimension width must be a finite number/,
  );
  assert.throws(
    () => Dimensions.create({
      length: 100,
      width: 50,
      height: 25,
      unit: 'UNKNOWN' as DimensionUnit,
    }),
    /Dimension unit is invalid/,
  );
});
