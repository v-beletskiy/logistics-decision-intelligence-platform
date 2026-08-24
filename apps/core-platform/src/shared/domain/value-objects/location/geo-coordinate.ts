import { SHARED_DOMAIN_ERROR_CODES } from "../../domain-error-codes.js";
import { DomainException } from "../../domain.exceptions.js";
import { requireFiniteNumber } from "../../validation/primitives/number/require-finite-number.js";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object.js";
import { ValueObject } from "../../core/value-object.js";

export interface GeoCoordinateProps {
  readonly latitude: number;
  readonly longitude: number;
}

/** An immutable geographic point expressed in decimal degrees. */
export class GeoCoordinate extends ValueObject<GeoCoordinate> {
  readonly latitude: number;
  readonly longitude: number;

  private constructor(props: GeoCoordinateProps) {
    super();
    assertPropsObject(props, "Geo coordinate");
    const latitude = requireFiniteNumber(props.latitude, "Latitude");
    const longitude = requireFiniteNumber(props.longitude, "Longitude");
    if (latitude < -90 || latitude > 90) {
      throw new DomainException(
        "Latitude must be between -90 and 90.",
        SHARED_DOMAIN_ERROR_CODES.latitudeOutOfRange,
      );
    }
    if (longitude < -180 || longitude > 180) {
      throw new DomainException(
        "Longitude must be between -180 and 180.",
        SHARED_DOMAIN_ERROR_CODES.longitudeOutOfRange,
      );
    }
    this.latitude = latitude;
    this.longitude = longitude;
    Object.freeze(this);
  }

  static create(props: GeoCoordinateProps): GeoCoordinate {
    return new GeoCoordinate(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.latitude, this.longitude];
  }
}
