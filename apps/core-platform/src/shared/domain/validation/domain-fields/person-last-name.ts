import { SHARED_DOMAIN_ERROR_CODES } from "../../domain-error-codes.js";
import { DomainException } from "../../domain.exceptions.js";
import { requireNonBlankString } from "../primitives/string/require-non-blank-string.js";

export const PERSON_LAST_NAME_MIN_LENGTH = 1;
export const PERSON_LAST_NAME_MAX_LENGTH = 100;

export function requirePersonLastName(
  value: unknown,
  label: string = "last name",
): string {
  const personLastName = requireNonBlankString(value, label);

  if (personLastName.length < PERSON_LAST_NAME_MIN_LENGTH) {
    throw new DomainException(
      `${label} must be not less than ${PERSON_LAST_NAME_MIN_LENGTH} characters.`,
      SHARED_DOMAIN_ERROR_CODES.textTooShort,
    );
  }
  if (personLastName.length > PERSON_LAST_NAME_MAX_LENGTH) {
    throw new DomainException(
      `${label} must be at most ${PERSON_LAST_NAME_MAX_LENGTH} characters.`,
      SHARED_DOMAIN_ERROR_CODES.textTooLong,
    );
  }

  return personLastName;
}
