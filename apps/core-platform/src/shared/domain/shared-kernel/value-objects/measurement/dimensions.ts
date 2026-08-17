import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../domain.exceptions";
import { requirePositiveFiniteNumber } from "../../validation/primitives/number/require-positive-finite-number";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";
import { Volume, VolumeUnit } from "./volume";

export enum DimensionUnit {
  Meter = "METER",
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

  /** Returns the rectangular volume represented by these dimensions. */
  volume(): Volume {
    const metersPerUnit = METERS_PER_UNIT[this.unit];
    const cubicMeters =
      this.length * this.width * this.height * metersPerUnit ** 3;
    return Volume.create({
      value: cubicMeters,
      unit: VolumeUnit.CubicMeter,
    });
  }

  /**
   * Whether this item fits the supplied axis-aligned dimension envelope.
   * Rotation is intentionally not inferred.
   */
  isWithinEnvelope(envelope: Dimensions): boolean {
    if (!(envelope instanceof Dimensions)) {
      throw new DomainException("Dimension envelope is invalid.");
    }

    const conversionFactor =
      METERS_PER_UNIT[this.unit] / METERS_PER_UNIT[envelope.unit];
    return (
      this.length * conversionFactor <= envelope.length &&
      this.width * conversionFactor <= envelope.width &&
      this.height * conversionFactor <= envelope.height
    );
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.length, this.width, this.height, this.unit];
  }
}

const METERS_PER_UNIT: Readonly<Record<DimensionUnit, number>> = {
  [DimensionUnit.Meter]: 1,
  [DimensionUnit.Centimeter]: 0.01,
  [DimensionUnit.Millimeter]: 0.001,
  [DimensionUnit.Inch]: 0.0254,
};

function requireDimensionUnit(value: unknown): DimensionUnit {
  if (!isEnumValue(DimensionUnit, value)) {
    throw new DomainException("Dimension unit is invalid.");
  }
  return value;
}
