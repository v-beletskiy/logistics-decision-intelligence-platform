import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../exceptions/domain.exception";
import { requireNonNegativeFiniteNumber } from "../../validation/primitives/number/require-non-negative-finite-number";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";

export enum WeightUnit {
  Kilogram = "KILOGRAM",
  Gram = "GRAM",
  Pound = "POUND",
}

export interface WeightProps {
  readonly value: number;
  readonly unit: WeightUnit;
}

/** An immutable quantity of mass. */
export class Weight extends ValueObject<Weight> {
  readonly value: number;
  readonly unit: WeightUnit;

  private constructor(props: WeightProps) {
    super();
    assertPropsObject(props, "Weight");
    this.value = requireNonNegativeFiniteNumber(props.value, "Weight value");
    this.unit = requireWeightUnit(props.unit);
    Object.freeze(this);
  }

  static create(props: WeightProps): Weight {
    return new Weight(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value, this.unit];
  }
}

function requireWeightUnit(value: unknown): WeightUnit {
  if (!isEnumValue(WeightUnit, value)) {
    throw new DomainException("Weight unit is invalid.");
  }
  return value;
}
