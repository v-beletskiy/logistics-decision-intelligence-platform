import { optionalTrimmedString } from "../../validation/primitives/string/optional-trimmed-string.js";
import { requireNonBlankString } from "../../validation/primitives/string/require-non-blank-string.js";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object.js";
import { ValueObject } from "../../core/value-object.js";

export interface AddressProps {
  readonly country: string;
  readonly stateOrRegion?: string;
  readonly city: string;
  readonly street: string;
  readonly buildingNumber: string;
  readonly postalCode: string;
}

/** An immutable human-readable postal address. */
export class Address extends ValueObject<Address> {
  readonly country: string;
  readonly stateOrRegion?: string;
  readonly city: string;
  readonly street: string;
  readonly buildingNumber: string;
  readonly postalCode: string;

  private constructor(props: AddressProps) {
    super();
    assertPropsObject(props, "Address");
    this.country = requireNonBlankString(props.country, "Address country");
    this.stateOrRegion = optionalTrimmedString(
      props.stateOrRegion,
      "Address state or region",
    );
    this.city = requireNonBlankString(props.city, "Address city");
    this.street = requireNonBlankString(props.street, "Address street");
    this.buildingNumber = requireNonBlankString(
      props.buildingNumber,
      "Address building number",
    );
    this.postalCode = requireNonBlankString(
      props.postalCode,
      "Address postal code",
    );
    Object.freeze(this);
  }

  static create(props: AddressProps): Address {
    return new Address(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [
      this.country,
      this.stateOrRegion,
      this.city,
      this.street,
      this.buildingNumber,
      this.postalCode,
    ];
  }
}
