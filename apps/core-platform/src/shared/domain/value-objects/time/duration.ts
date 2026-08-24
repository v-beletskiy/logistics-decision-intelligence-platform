import { SHARED_DOMAIN_ERROR_CODES } from "../../domain-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../domain.exceptions.js";
import { requireNonNegativeFiniteNumber } from "../../validation/primitives/number/require-non-negative-finite-number.js";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object.js";
import { ValueObject } from "../../core/value-object.js";

export interface DurationProps {
  readonly value: number;
  readonly unit: DurationUnit;
}

export enum DurationUnit {
  Hour = "HOUR",
  Minute = "MINUTE",
  Second = "SECOND",
}

/** An immutable non-negative duration. */
export class Duration extends ValueObject<Duration> {
  readonly value: number;
  readonly unit: DurationUnit;

  private constructor(props: DurationProps) {
    super();
    assertPropsObject(props, "Duration");
    this.value = requireNonNegativeFiniteNumber(props.value, "Duration value");
    this.unit = requireDurationUnit(props.unit);
    Object.freeze(this);
  }

  static create(props: DurationProps): Duration {
    return new Duration(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value, this.unit];
  }
}

function requireDurationUnit(value: unknown): DurationUnit {
  if (!isEnumValue(DurationUnit, value)) {
    throw new DomainException(
      "Duration unit is invalid.",
      SHARED_DOMAIN_ERROR_CODES.invalidDurationUnit,
    );
  }
  return value;
}
