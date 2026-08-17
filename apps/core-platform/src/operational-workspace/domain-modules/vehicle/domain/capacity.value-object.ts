import {
  Dimensions,
  type DimensionsProps,
  Volume,
  type VolumeProps,
  Weight,
  type WeightProps,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { assertPropsObject } from "../../../../shared/domain/shared-kernel/validation/primitives/object/assert-props-object";
import { ValueObject } from "../../../../shared/domain/shared-kernel/core/value-object";

export interface CapacityProps {
  readonly maxWeight: WeightProps;
  readonly maxItemDimensions: DimensionsProps;
  readonly maxVolume: VolumeProps;
}

export class Capacity extends ValueObject<Capacity> {
  readonly maxWeight: Weight;
  readonly maxItemDimensions: Dimensions;
  readonly maxVolume: Volume;

  private constructor(props: CapacityProps) {
    super();
    assertCapacityPropsAreSpecified(props);
    this.maxWeight = Weight.create(props.maxWeight);
    this.maxItemDimensions = Dimensions.create(props.maxItemDimensions);
    this.maxVolume = Volume.create(props.maxVolume);
    Object.freeze(this);
  }

  static create(props: CapacityProps): Capacity {
    return new Capacity(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [
      this.maxWeight.value,
      this.maxWeight.unit,
      this.maxItemDimensions.length,
      this.maxItemDimensions.width,
      this.maxItemDimensions.height,
      this.maxItemDimensions.unit,
      this.maxVolume.value,
      this.maxVolume.unit,
    ];
  }
}

function assertCapacityPropsAreSpecified(
  props: unknown,
): asserts props is CapacityProps {
  assertPropsObject(props, "Capacity");
  if (
    !("maxWeight" in props) ||
    !("maxItemDimensions" in props) ||
    !("maxVolume" in props) ||
    !props.maxWeight ||
    !props.maxItemDimensions ||
    !props.maxVolume
  ) {
    throw new DomainException(
      "A compartment must define weight, dimensions, and volume capacity.",
    );
  }
}
