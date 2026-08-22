import { ValueObject } from "../../../../../shared/domain/core/value-object";
import { DomainException } from "../../../../../shared/domain/domain.exceptions";
import { USER_ERROR_CODES } from "./user-error-codes";

const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

/** Canonical local-authentication email address and User Account lookup key. */
export class UserEmail extends ValueObject<UserEmail> {
  readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
    Object.freeze(this);
  }

  static create(value: unknown): UserEmail {
    if (typeof value !== "string") {
      throw invalidUserEmail();
    }

    const normalized = value.trim().toLowerCase();
    if (
      normalized.length === 0 ||
      normalized.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(normalized)
    ) {
      throw invalidUserEmail();
    }

    return new UserEmail(normalized);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value];
  }
}

function invalidUserEmail(): DomainException {
  return new DomainException(
    "User email address is invalid.",
    USER_ERROR_CODES.invalidEmail,
  );
}
