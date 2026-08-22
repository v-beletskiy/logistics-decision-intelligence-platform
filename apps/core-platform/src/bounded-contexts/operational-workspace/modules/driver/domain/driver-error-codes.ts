import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions";

export const DRIVER_ERROR_CODES = defineErrorCodes("driver", {
  driverStatusIsInvalid: "driver-status-is-invalid",
  fieldTooLong: "field-too-long",
  driverCertificationsMustBeSpecifiedAsAList:
    "driver-certifications-must-be-specified-as-a-list",
  driverCertificationsMustBeValidCertificationEntities:
    "driver-certifications-must-be-valid-certification-entities",
  driverCertificationIdentifiersMustBeUnique:
    "driver-certification-identifiers-must-be-unique",
  alreadySuspended: "already-suspended",
  notSuspended: "not-suspended",
  suspendedAvailabilityChange: "suspended-availability-change",
  certificationNotFound: "certification-not-found",
  certificationDuplicate: "certification-duplicate",
  certificationLimitExceeded: "certification-limit-exceeded",
  certificationFieldTooLong: "certification-field-too-long",
  certificationPeriodInvalid: "certification-period-invalid",
});
