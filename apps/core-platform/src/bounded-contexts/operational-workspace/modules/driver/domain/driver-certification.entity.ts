import { Entity } from "../../../../../shared/domain/core/entity.js";
import { DomainException } from "../../../../../shared/domain/domain.exceptions.js";
import { requireValidDate } from "../../../../../shared/domain/validation/primitives/date/require-valid-date.js";
import { requireNonBlankString } from "../../../../../shared/domain/validation/primitives/string/require-non-blank-string.js";

import { DriverCertificationId } from "./driver-certification-id.js";
import { DRIVER_ERROR_CODES } from "./driver-error-codes.js";

export const MAX_DRIVER_CERTIFICATION_TYPE_LENGTH = 100;
export const MAX_DRIVER_CERTIFICATION_CREDENTIAL_NUMBER_LENGTH = 100;

export interface DriverCertificationProps {
  readonly type: string;
  readonly credentialNumber: string;
  readonly validFrom: Date;
  readonly validUntil: Date;
}

/** Identified credential whose lifecycle is owned by a Driver aggregate. */
export class DriverCertification extends Entity<DriverCertificationId> {
  readonly type: string;
  readonly credentialNumber: string;
  private readonly _validFrom: Date;
  private readonly _validUntil: Date;

  private constructor(
    id: DriverCertificationId,
    props: DriverCertificationProps,
  ) {
    super(id);
    this.type = requireNonBlankString(props.type, "Driver certification type");
    if (this.type.length > MAX_DRIVER_CERTIFICATION_TYPE_LENGTH) {
      throw new DomainException(
        `Driver certification type must be at most ${MAX_DRIVER_CERTIFICATION_TYPE_LENGTH} characters.`,
        DRIVER_ERROR_CODES.certificationFieldTooLong,
        { field: "type", maxLength: MAX_DRIVER_CERTIFICATION_TYPE_LENGTH },
      );
    }
    this.credentialNumber = requireNonBlankString(
      props.credentialNumber,
      "Driver certification credential number",
    );
    if (
      this.credentialNumber.length >
      MAX_DRIVER_CERTIFICATION_CREDENTIAL_NUMBER_LENGTH
    ) {
      throw new DomainException(
        `Driver certification credential number must be at most ${MAX_DRIVER_CERTIFICATION_CREDENTIAL_NUMBER_LENGTH} characters.`,
        DRIVER_ERROR_CODES.certificationFieldTooLong,
        {
          field: "credentialNumber",
          maxLength: MAX_DRIVER_CERTIFICATION_CREDENTIAL_NUMBER_LENGTH,
        },
      );
    }
    this._validFrom = requireValidDate(
      props.validFrom,
      "Driver certification validity start",
    );
    this._validUntil = requireValidDate(
      props.validUntil,
      "Driver certification validity end",
    );
    if (this._validFrom >= this._validUntil) {
      throw new DomainException(
        "Driver certification validity start must be before its end.",
        DRIVER_ERROR_CODES.certificationPeriodInvalid,
      );
    }
    Object.freeze(this);
  }

  get validFrom(): Date {
    return new Date(this._validFrom);
  }

  get validUntil(): Date {
    return new Date(this._validUntil);
  }

  static create(details: DriverCertificationProps): DriverCertification {
    return new DriverCertification(DriverCertificationId.generate(), details);
  }

  static reconstitute(
    id: DriverCertificationId,
    details: DriverCertificationProps,
  ): DriverCertification {
    return new DriverCertification(id, details);
  }
}
