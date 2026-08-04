import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../exceptions/domain.exception";
import { requirePositiveFiniteNumber } from "../../validation/primitives/number/require-positive-finite-number";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";

export enum DimensionUnit {
  Centimeter = "CENTIMETER",
  Millimeter = "MILLIMETER",
  Inch = "INCH",
}

export interface DimensionsProps {
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly unit: DimensionUnit;
}

/** Immutable physical dimensions. */
export class Dimensions extends ValueObject<Dimensions> {
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly unit: DimensionUnit;

  private constructor(props: DimensionsProps) {
    super();
    assertPropsObject(props, "Dimensions");
    this.length = requirePositiveFiniteNumber(props.length, "Dimension length");
    this.width = requirePositiveFiniteNumber(props.width, "Dimension width");
    this.height = requirePositiveFiniteNumber(props.height, "Dimension height");
    this.unit = requireDimensionUnit(props.unit);
    Object.freeze(this);
  }

  static create(props: DimensionsProps): Dimensions {
    return new Dimensions(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.length, this.width, this.height, this.unit];
  }
}

function requireDimensionUnit(value: unknown): DimensionUnit {
  if (!isEnumValue(DimensionUnit, value)) {
    throw new DomainException("Dimension unit is invalid.");
  }
  return value;
}
