import { Entity } from "../../../../shared/domain/shared-kernel/core/entity";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { requireValidDate } from "../../../../shared/domain/shared-kernel/validation/primitives/date/require-valid-date";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";

import { DriverCertificationId } from "./driver-certification-id";

export const MAX_DRIVER_CERTIFICATION_TYPE_LENGTH = 100;
export const MAX_DRIVER_CERTIFICATION_CREDENTIAL_NUMBER_LENGTH = 100;

const CERTIFICATION_FIELD_TOO_LONG_ERR_CODE =
  "driver.certification-field-too-long";

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
        CERTIFICATION_FIELD_TOO_LONG_ERR_CODE,
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
        CERTIFICATION_FIELD_TOO_LONG_ERR_CODE,
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
        "driver.certification-period-invalid",
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
