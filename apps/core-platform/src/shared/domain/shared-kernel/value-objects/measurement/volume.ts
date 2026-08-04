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

  protected equalityComponents(): readonly unknown[] {
    return [this.value, this.unit];
  }
}

function requireVolumeUnit(value: unknown): VolumeUnit {
  if (!isEnumValue(VolumeUnit, value)) {
    throw new DomainException("Volume unit is invalid.");
  }
  return value;
}
