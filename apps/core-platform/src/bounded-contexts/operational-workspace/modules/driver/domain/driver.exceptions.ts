import { DomainConflictException } from "../../../../../shared/domain/domain.exceptions.js";
import { DRIVER_ERROR_CODES } from "./driver-error-codes.js";

export class DriverAlreadySuspendedException extends DomainConflictException {
  constructor() {
    super(
      "A driver is already suspended.",
      DRIVER_ERROR_CODES.alreadySuspended,
    );
  }
}

export class DriverNotSuspendedException extends DomainConflictException {
  constructor() {
    super(
      "Only a suspended driver can be reinstated.",
      DRIVER_ERROR_CODES.notSuspended,
    );
  }
}

export class SuspendedDriverAvailabilityChangeException extends DomainConflictException {
  constructor() {
    super(
      "A suspended driver must be reinstated before availability can change.",
      DRIVER_ERROR_CODES.suspendedAvailabilityChange,
    );
  }
}

export class DriverCertificationNotFoundException extends DomainConflictException {
  constructor() {
    super(
      "The certification does not belong to this driver.",
      DRIVER_ERROR_CODES.certificationNotFound,
    );
  }
}

export class DuplicateDriverCertificationException extends DomainConflictException {
  constructor() {
    super(
      "A driver certification type and credential number must be unique.",
      DRIVER_ERROR_CODES.certificationDuplicate,
    );
  }
}

export class DriverCertificationLimitExceededException extends DomainConflictException {
  constructor(limit: number) {
    super(
      `A driver cannot have more than ${limit} certifications.`,
      DRIVER_ERROR_CODES.certificationLimitExceeded,
      { limit },
    );
  }
}
