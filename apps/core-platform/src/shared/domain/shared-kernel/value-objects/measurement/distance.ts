import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../exceptions/domain.exception";
import { requireNonNegativeFiniteNumber } from "../../validation/primitives/number/require-non-negative-finite-number";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";

export enum DistanceUnit {
  Kilometer = "KILOMETER",
  Mile = "MILE",
}

export interface DistanceProps {
  readonly value: number;
  readonly unit: DistanceUnit;
}

/** An immutable quantity of distance. */
export class Distance extends ValueObject<Distance> {
  readonly value: number;
  readonly unit: DistanceUnit;

  private constructor(props: DistanceProps) {
    super();
    assertPropsObject(props, "Distance");
    this.value = requireNonNegativeFiniteNumber(props.value, "Distance value");
    this.unit = requireDistanceUnit(props.unit);
    Object.freeze(this);
  }

  static create(props: DistanceProps): Distance {
    return new Distance(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value, this.unit];
  }
}

function requireDistanceUnit(value: unknown): DistanceUnit {
  if (!isEnumValue(DistanceUnit, value)) {
    throw new DomainException("Distance unit is invalid.");
  }
  return value;
}
