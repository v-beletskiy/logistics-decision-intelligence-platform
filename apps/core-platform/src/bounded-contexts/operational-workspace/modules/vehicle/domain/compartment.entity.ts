import { VEHICLE_ERROR_CODES } from "./vehicle-error-codes";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../../../shared/domain/domain.exceptions";
import { assertPropsObject } from "../../../../../shared/domain/validation/primitives/object/assert-props-object";
import { optionalTrimmedString } from "../../../../../shared/domain/validation/primitives/string/optional-trimmed-string";
import { Entity } from "../../../../../shared/domain/core/entity";

import { Capacity, type CapacityProps } from "./capacity.value-object";
import { CompartmentId } from "./compartment-id";

export enum CompartmentType {
  DryCargo = "DRY_CARGO",
  Refrigerated = "REFRIGERATED",
  Frozen = "FROZEN",
  Hazardous = "HAZARDOUS",
}

export interface CompartmentProps {
  readonly type: CompartmentType;
  readonly capacity: CapacityProps;
  readonly name?: string;
}

/** An identified cargo area belonging to a Vehicle aggregate. */
export class Compartment extends Entity<CompartmentId> {
  readonly type: CompartmentType;
  readonly capacity: Capacity;
  readonly name?: string;

  private constructor(id: CompartmentId, props: CompartmentProps) {
    super(id);
    assertPropsObject(props, "Compartment");
    const type = requireCompartmentType(props.type);
    const name = optionalTrimmedString(props.name, "Compartment name");
    const capacity = Capacity.create(props.capacity);

    this.type = type;
    this.name = name;
    this.capacity = capacity;
    Object.freeze(this);
  }

  static create(props: CompartmentProps): Compartment {
    return new Compartment(CompartmentId.generate(), props);
  }

  static reconstitute(id: CompartmentId, props: CompartmentProps): Compartment {
    return new Compartment(id, props);
  }
}

function requireCompartmentType(value: unknown): CompartmentType {
  if (!isEnumValue(CompartmentType, value)) {
    throw new DomainException(
      "A valid compartment type must be specified.",
      VEHICLE_ERROR_CODES.validCompartmentTypeMustBeSpecified,
    );
  }
  return value;
}
