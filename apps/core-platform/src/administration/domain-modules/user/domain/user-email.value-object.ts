import { ValueObject } from "../../../../shared/domain/shared-kernel/core/value-object";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";

const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const INVALID_USER_EMAIL_ERR_CODE = "user.email-invalid";

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
    INVALID_USER_EMAIL_ERR_CODE,
  );
}
