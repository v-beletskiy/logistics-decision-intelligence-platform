import { ApplicationInputException } from "../../../../../shared/app/app.exceptions.js";

export const MIN_LOCAL_PASSWORD_LENGTH = 12;
export const MAX_LOCAL_PASSWORD_LENGTH = 128;

/**
 * Security policy for plaintext passwords accepted by the local authenticator.
 *
 * UserAccount deliberately stores only a password hash, so this policy belongs
 * to the application authentication flow rather than the UserAccount aggregate.
 */
export class LocalPasswordPolicy {
  static assertAccepts(password: string): void {
    if (
      password.length < MIN_LOCAL_PASSWORD_LENGTH ||
      password.length > MAX_LOCAL_PASSWORD_LENGTH
    ) {
      throw new ApplicationInputException(
        `Password length must be between ${MIN_LOCAL_PASSWORD_LENGTH} and ${MAX_LOCAL_PASSWORD_LENGTH} characters.`,
        "user.password-length-invalid",
        {
          minLength: MIN_LOCAL_PASSWORD_LENGTH,
          maxLength: MAX_LOCAL_PASSWORD_LENGTH,
        },
      );
    }
  }
}
