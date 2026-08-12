import { Entity } from "../../../../shared/domain/shared-kernel/core/entity";
import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { requireValidDate } from "../../../../shared/domain/shared-kernel/validation/primitives/date/require-valid-date";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";

import { DriverCertificationId } from "./driver-certification-id";

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
    this.credentialNumber = requireNonBlankString(
      props.credentialNumber,
      "Driver certification credential number",
    );
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
