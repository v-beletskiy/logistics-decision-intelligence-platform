import { ApplicationConflictException } from "../../../../../shared/app/app.exceptions.js";

export class UserEmailConflictException extends ApplicationConflictException {
  constructor(options?: ErrorOptions) {
    super(
      "A user with this email already exists.",
      "user.email-conflict",
      undefined,
      options,
    );
  }
}
