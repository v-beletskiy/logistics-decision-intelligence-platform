import { SHARED_DOMAIN_ERROR_CODES } from "../../domain-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../domain.exceptions.js";
import { requireNonNegativeFiniteNumber } from "../../validation/primitives/number/require-non-negative-finite-number.js";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object.js";
import { ValueObject } from "../../core/value-object.js";

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

  /** Returns this weight expressed in the requested unit. */
  valueIn(unit: WeightUnit): number {
    const targetUnit = requireWeightUnit(unit);
    return (
      (this.value * KILOGRAMS_PER_UNIT[this.unit]) /
      KILOGRAMS_PER_UNIT[targetUnit]
    );
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value, this.unit];
  }
}

const KILOGRAMS_PER_UNIT: Readonly<Record<WeightUnit, number>> = {
  [WeightUnit.Kilogram]: 1,
  [WeightUnit.Gram]: 0.001,
  [WeightUnit.Pound]: 0.453_592_37,
};

function requireWeightUnit(value: unknown): WeightUnit {
  if (!isEnumValue(WeightUnit, value)) {
    throw new DomainException(
      "Weight unit is invalid.",
      SHARED_DOMAIN_ERROR_CODES.invalidWeightUnit,
    );
  }
  return value;
}
