import { DRIVER_ERROR_CODES } from "./driver-error-codes";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../../../shared/domain/domain.exceptions";
import { optionalTrimmedString } from "../../../../../shared/domain/validation/primitives/string/optional-trimmed-string";
import { requireNonBlankString } from "../../../../../shared/domain/validation/primitives/string/require-non-blank-string";
import { Aggregate } from "../../../../../shared/domain/core/aggregate";

import type { DriverEvent } from "./driver.events";
import {
  DriverCertification,
  type DriverCertificationProps,
} from "./driver-certification.entity";
import { DriverCertificationId } from "./driver-certification-id";
import { DriverId } from "./driver-id";
import { DepotId } from "../../depot/domain/depot-id";
import { requirePersonFirstName } from "../../../../../shared/domain/validation/domain-fields/person-first-name";
import { requirePersonLastName } from "../../../../../shared/domain/validation/domain-fields/person-last-name";
import {
  DriverAlreadySuspendedException,
  DriverCertificationLimitExceededException,
  DriverCertificationNotFoundException,
  DriverNotSuspendedException,
  DuplicateDriverCertificationException,
  SuspendedDriverAvailabilityChangeException,
} from "./driver.exceptions";

export enum DriverStatus {
  Available = "AVAILABLE",
  Unavailable = "UNAVAILABLE",
  Suspended = "SUSPENDED",
}

export const MAX_DRIVER_CERTIFICATIONS = 10;
export const MAX_DRIVER_LICENSE_NUMBER_LENGTH = 100;
export const MAX_DRIVER_PHONE_NUMBER_LENGTH = 32;

export interface DriverDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly licenseNumber: string;
  readonly depotId?: DepotId;
  readonly phoneNumber?: string;
}

export interface RegisterDriverParams extends DriverDetails {
  readonly certifications?: readonly DriverCertificationProps[];
}

export interface DriverProps extends DriverDetails {
  readonly certifications: readonly DriverCertification[];
  readonly status: DriverStatus;
}

/** Transportation operator with one explicit operational status. */
export class Driver extends Aggregate<DriverId, DriverEvent> {
  private _firstName: string;
  private _lastName: string;
  private _licenseNumber: string;
  private _depotId?: DepotId;
  private _phoneNumber?: string;
  private _status: DriverStatus;
  private readonly _certifications: DriverCertification[];

  private constructor(id: DriverId, props: DriverProps) {
    super(id);

    const validatedDetails = Driver.validateDetails(props);
    this._firstName = validatedDetails.firstName;
    this._lastName = validatedDetails.lastName;
    this._licenseNumber = validatedDetails.licenseNumber;
    this._depotId = validatedDetails.depotId;
    this._phoneNumber = validatedDetails.phoneNumber;

    if (!isEnumValue(DriverStatus, props.status)) {
      throw new DomainException(
        "A driver status is invalid.",
        DRIVER_ERROR_CODES.driverStatusIsInvalid,
      );
    }
    this._status = props.status;
    this._certifications = copyAndValidateCertifications(props.certifications);
  }

  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get licenseNumber(): string {
    return this._licenseNumber;
  }
  get depotId(): DepotId | undefined {
    return this._depotId;
  }
  get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }
  get status(): DriverStatus {
    return this._status;
  }

  get certifications(): readonly DriverCertification[] {
    return [...this._certifications];
  }

  static register(details: RegisterDriverParams): Driver {
    const driver = new Driver(DriverId.generate(), {
      ...details,
      certifications: (details.certifications ?? []).map((certification) =>
        DriverCertification.create(certification),
      ),
      status: DriverStatus.Available,
    });
    driver.recordDomainEvent({
      aggregateId: driver.id.value,
      occurredAt: new Date(),
      type: "DriverRegisteredDomainEvent",
    });
    return driver;
  }

  static reconstitute(id: DriverId, props: DriverProps): Driver {
    return new Driver(id, props);
  }

  private static validateDetails(details: DriverDetails): DriverDetails {
    return {
      firstName: requirePersonFirstName(details.firstName, "Driver first name"),
      lastName: requirePersonLastName(details.lastName, "Driver last name"),
      licenseNumber: requireDriverString(
        requireNonBlankString(details.licenseNumber, "Driver license number"),
        MAX_DRIVER_LICENSE_NUMBER_LENGTH,
        "Driver license number",
      ),
      depotId: optionalDepotId(details.depotId),
      phoneNumber: optionalLimitedString(
        optionalTrimmedString(details.phoneNumber, "Driver phone number"),
        MAX_DRIVER_PHONE_NUMBER_LENGTH,
        "Driver phone number",
      ),
    };
  }

  updateDetails(details: DriverDetails): void {
    const validatedDetails = Driver.validateDetails(details);
    this._firstName = validatedDetails.firstName;
    this._lastName = validatedDetails.lastName;
    this._licenseNumber = validatedDetails.licenseNumber;
    this._depotId = validatedDetails.depotId;
    this._phoneNumber = validatedDetails.phoneNumber;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverDetailsUpdatedDomainEvent",
    });
  }

  markAvailable(): void {
    this.assertNotSuspended();
    this._status = DriverStatus.Available;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverMarkedAvailableDomainEvent",
    });
  }

  markUnavailable(): void {
    this.assertNotSuspended();
    this._status = DriverStatus.Unavailable;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverMarkedUnavailableDomainEvent",
    });
  }

  suspend(): void {
    if (this._status === DriverStatus.Suspended) {
      throw new DriverAlreadySuspendedException();
    }
    this._status = DriverStatus.Suspended;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverSuspendedDomainEvent",
    });
  }

  reinstate(): void {
    if (this._status !== DriverStatus.Suspended) {
      throw new DriverNotSuspendedException();
    }
    this._status = DriverStatus.Unavailable;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverReinstatedDomainEvent",
    });
  }

  addCertification(details: DriverCertificationProps): DriverCertificationId {
    assertCertificationCount(this._certifications.length + 1);
    const certification = DriverCertification.create(details);
    this.assertCertificationIsUnique(certification);
    this._certifications.push(certification);
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverCertificationAddedDomainEvent",
      certificationId: certification.id.value,
    });
    return certification.id;
  }

  updateCertification(
    id: DriverCertificationId,
    details: DriverCertificationProps,
  ): void {
    const index = this.certificationIndex(id);
    const certification = DriverCertification.reconstitute(id, details);
    this.assertCertificationIsUnique(certification, id);
    this._certifications[index] = certification;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverCertificationUpdatedDomainEvent",
      certificationId: id.value,
    });
  }

  removeCertification(id: DriverCertificationId): void {
    const index = this.certificationIndex(id);
    this._certifications.splice(index, 1);
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "DriverCertificationRemovedDomainEvent",
      certificationId: id.value,
    });
  }

  private assertNotSuspended(): void {
    if (this._status === DriverStatus.Suspended) {
      throw new SuspendedDriverAvailabilityChangeException();
    }
  }

  private certificationIndex(id: DriverCertificationId): number {
    const index = this._certifications.findIndex((certification) =>
      certification.id.equals(id),
    );
    if (index === -1) {
      throw new DriverCertificationNotFoundException();
    }
    return index;
  }

  private assertCertificationIsUnique(
    candidate: DriverCertification,
    replacedId?: DriverCertificationId,
  ): void {
    const duplicate = this._certifications.some(
      (certification) =>
        !certification.id.equals(replacedId ?? candidate.id) &&
        certification.type === candidate.type &&
        certification.credentialNumber === candidate.credentialNumber,
    );
    if (duplicate) {
      throw new DuplicateDriverCertificationException();
    }
  }
}

function optionalLimitedString(
  value: string | undefined,
  maxLength: number,
  label: string,
): string | undefined {
  return value === undefined
    ? undefined
    : requireDriverString(value, maxLength, label);
}

function requireDriverString(
  value: string,
  maxLength: number,
  label: string,
): string {
  if (value.length > maxLength) {
    throw new DomainException(
      `${label} must be at most ${maxLength} characters.`,
      DRIVER_ERROR_CODES.fieldTooLong,
    );
  }
  return value;
}

function optionalDepotId(value: DepotId | undefined): DepotId | undefined {
  return value;
}

function copyAndValidateCertifications(
  certifications: readonly DriverCertification[],
): DriverCertification[] {
  if (!Array.isArray(certifications)) {
    throw new DomainException(
      "Driver certifications must be specified as a list.",
      DRIVER_ERROR_CODES.driverCertificationsMustBeSpecifiedAsAList,
    );
  }
  assertCertificationCount(certifications.length);
  if (
    certifications.some(
      (certification) => !(certification instanceof DriverCertification),
    )
  ) {
    throw new DomainException(
      "Driver certifications must be valid certification entities.",
      DRIVER_ERROR_CODES.driverCertificationsMustBeValidCertificationEntities,
    );
  }
  const ids = certifications.map((certification) => certification.id.value);
  if (new Set(ids).size !== ids.length) {
    throw new DomainException(
      "Driver certification identifiers must be unique.",
      DRIVER_ERROR_CODES.driverCertificationIdentifiersMustBeUnique,
    );
  }
  assertCertificationCredentialsAreUnique(certifications);
  return [...certifications];
}

function assertCertificationCredentialsAreUnique(
  certifications: readonly DriverCertification[],
): void {
  const credentialNumbersByType = new Map<string, Set<string>>();
  for (const certification of certifications) {
    let credentialNumbers = credentialNumbersByType.get(certification.type);
    if (credentialNumbers === undefined) {
      credentialNumbers = new Set<string>();
      credentialNumbersByType.set(certification.type, credentialNumbers);
    }
    if (credentialNumbers.has(certification.credentialNumber)) {
      throw new DuplicateDriverCertificationException();
    }
    credentialNumbers.add(certification.credentialNumber);
  }
}

function assertCertificationCount(count: number): void {
  if (count > MAX_DRIVER_CERTIFICATIONS) {
    throw new DriverCertificationLimitExceededException(
      MAX_DRIVER_CERTIFICATIONS,
    );
  }
}
