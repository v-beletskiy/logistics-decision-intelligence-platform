import { ApplicationConflictException } from "../../../../../shared/app/app.exceptions";

export class DriverLicenseNumberConflictException extends ApplicationConflictException {
  constructor(options?: ErrorOptions) {
    super(
      "A driver with this license number already exists.",
      "driver.license-number-conflict",
      undefined,
      options,
    );
  }
}
