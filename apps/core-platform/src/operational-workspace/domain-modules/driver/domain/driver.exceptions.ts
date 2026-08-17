import { DomainConflictException } from "../../../../shared/domain/shared-kernel/domain.exceptions";

export class DriverAlreadySuspendedException extends DomainConflictException {
  constructor() {
    super("A driver is already suspended.", "driver.already-suspended");
  }
}

export class DriverNotSuspendedException extends DomainConflictException {
  constructor() {
    super("Only a suspended driver can be reinstated.", "driver.not-suspended");
  }
}

export class SuspendedDriverAvailabilityChangeException extends DomainConflictException {
  constructor() {
    super(
      "A suspended driver must be reinstated before availability can change.",
      "driver.suspended-availability-change",
    );
  }
}

export class DriverCertificationNotFoundException extends DomainConflictException {
  constructor() {
    super(
      "The certification does not belong to this driver.",
      "driver.certification-not-found",
    );
  }
}

export class DuplicateDriverCertificationException extends DomainConflictException {
  constructor() {
    super(
      "A driver certification type and credential number must be unique.",
      "driver.certification-duplicate",
    );
  }
}

export class DriverCertificationLimitExceededException extends DomainConflictException {
  constructor(limit: number) {
    super(
      `A driver cannot have more than ${limit} certifications.`,
      "driver.certification-limit-exceeded",
      { limit },
    );
  }
}
