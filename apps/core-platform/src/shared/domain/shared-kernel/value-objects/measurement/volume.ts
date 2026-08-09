import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../exceptions/domain.exception";
import { requireNonNegativeFiniteNumber } from "../../validation/primitives/number/require-non-negative-finite-number";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";

export enum VolumeUnit {
  CubicMeter = "CUBIC_METER",
  CubicFoot = "CUBIC_FOOT",
  Liter = "LITER",
}

export interface VolumeProps {
  readonly value: number;
  readonly unit: VolumeUnit;
}

/** An immutable quantity of volume. */
export class Volume extends ValueObject<Volume> {
  readonly value: number;
  readonly unit: VolumeUnit;

  private constructor(props: VolumeProps) {
    super();
    assertPropsObject(props, "Volume");
    this.value = requireNonNegativeFiniteNumber(props.value, "Volume value");
    this.unit = requireVolumeUnit(props.unit);
    Object.freeze(this);
  }

  static create(props: VolumeProps): Volume {
    return new Volume(props);
  }

  /** Returns this volume expressed in the requested unit. */
  valueIn(unit: VolumeUnit): number {
    const targetUnit = requireVolumeUnit(unit);
    return (
      (this.value * CUBIC_METERS_PER_UNIT[this.unit]) /
      CUBIC_METERS_PER_UNIT[targetUnit]
    );
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value, this.unit];
  }
}

const CUBIC_METERS_PER_UNIT: Readonly<Record<VolumeUnit, number>> = {
  [VolumeUnit.CubicMeter]: 1,
  [VolumeUnit.CubicFoot]: 0.028_316_846_592,
  [VolumeUnit.Liter]: 0.001,
};

function requireVolumeUnit(value: unknown): VolumeUnit {
  if (!isEnumValue(VolumeUnit, value)) {
    throw new DomainException("Volume unit is invalid.");
  }
  return value;
}
