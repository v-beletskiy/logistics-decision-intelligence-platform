import { ApplicationConflictException } from "../../../../../shared/app/app.exceptions.js";

export class VehicleRegistrationNumberConflictException extends ApplicationConflictException {
  constructor(options?: ErrorOptions) {
    super(
      "A vehicle with this registration number already exists.",
      "vehicle.registration-number-conflict",
      undefined,
      options,
    );
  }
}
