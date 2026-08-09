import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { optionalTrimmedString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/optional-trimmed-string";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";
import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";

import type { DriverEvent } from "./events/driver.domain-events";
import { DriverId } from "./driver-id";
import { validatePersonFirstName } from "../../../../shared/domain/shared-kernel/validation/domain-fields/person-first-name";
import { validatePersonLastName } from "../../../../shared/domain/shared-kernel/validation/domain-fields/person-last-name";

export enum DriverStatus {
  Available = "AVAILABLE",
  Unavailable = "UNAVAILABLE",
  Suspended = "SUSPENDED",
}

export interface DriverDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly licenseNumber: string;
  readonly depotId?: string;
  readonly phoneNumber?: string;
}

export interface DriverProps extends DriverDetails {
  readonly status: DriverStatus;
}

/** Transportation operator with one explicit operational status. */
export class Driver extends Aggregate<DriverId, DriverEvent> {
  private _firstName: string;
  private _lastName: string;
  private _licenseNumber: string;
  private _depotId?: string;
  private _phoneNumber?: string;
  private _status: DriverStatus;

  private constructor(id: DriverId, props: DriverProps, isNew: boolean) {
    super(id, isNew);

    const validatedDetails = Driver.validateDetails(props);
    this._firstName = validatedDetails.firstName;
    this._lastName = validatedDetails.lastName;
    this._licenseNumber = validatedDetails.licenseNumber;
    this._depotId = validatedDetails.depotId;
    this._phoneNumber = validatedDetails.phoneNumber;

    this._status = props.status;
    if (!isEnumValue(DriverStatus, this._status)) {
      throw new DomainException("A driver status is invalid.");
    }
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
  get depotId(): string | undefined {
    return this._depotId;
  }
  get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }
  get status(): DriverStatus {
    return this._status;
  }

  static register(details: DriverDetails): Driver {
    const driver = new Driver(
      DriverId.generate(),
      {
        ...details,
        status: DriverStatus.Available,
      },
      true,
    );
    driver.raiseDomainEvent("DriverRegisteredDomainEvent");
    return driver;
  }

  static reconstitute(id: DriverId, props: DriverProps): Driver {
    return new Driver(id, props, false);
  }

  private static validateDetails(details: DriverDetails): DriverDetails {
    return {
      firstName: validatePersonFirstName(
        details.firstName,
        "Driver first name",
      ),
      lastName: validatePersonLastName(details.lastName, "Driver last name"),
      licenseNumber: requireNonBlankString(
        details.licenseNumber,
        "Driver license number",
      ),
      depotId: optionalTrimmedString(
        details.depotId,
        "Driver depot identifier",
      ),
      phoneNumber: optionalTrimmedString(
        details.phoneNumber,
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
    this.raiseDomainEvent("DriverDetailsUpdatedDomainEvent");
  }

  markAvailable(): void {
    this.assertNotSuspended();
    this._status = DriverStatus.Available;
    this.raiseDomainEvent("DriverMarkedAvailableDomainEvent");
  }

  markUnavailable(): void {
    this.assertNotSuspended();
    this._status = DriverStatus.Unavailable;
    this.raiseDomainEvent("DriverMarkedUnavailableDomainEvent");
  }

  suspend(): void {
    if (this._status === DriverStatus.Suspended) {
      throw new DomainException("A driver is already suspended.");
    }
    this._status = DriverStatus.Suspended;
    this.raiseDomainEvent("DriverSuspendedDomainEvent");
  }

  reinstate(): void {
    if (this._status !== DriverStatus.Suspended) {
      throw new DomainException("Only a suspended driver can be reinstated.");
    }
    this._status = DriverStatus.Unavailable;
    this.raiseDomainEvent("DriverReinstatedDomainEvent");
  }

  private assertNotSuspended(): void {
    if (this._status === DriverStatus.Suspended) {
      throw new DomainException(
        "A suspended driver must be reinstated before availability can change.",
      );
    }
  }

  private raiseDomainEvent(type: DriverEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } as DriverEvent);
  }
}
