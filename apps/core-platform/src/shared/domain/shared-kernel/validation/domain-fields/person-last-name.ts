import { DomainException } from "../../domain.exceptions";
import { requireNonBlankString } from "../primitives/string/require-non-blank-string";

export const PERSON_LAST_NAME_MIN_LENGTH = 1;
export const PERSON_LAST_NAME_MAX_LENGTH = 100;

export function validatePersonLastName(
  value: unknown,
  label: string = "last name",
): string {
  const personLastName = requireNonBlankString(value, label);

  if (personLastName.length < PERSON_LAST_NAME_MIN_LENGTH) {
    throw new DomainException(
      `${label} must be not less than ${PERSON_LAST_NAME_MIN_LENGTH} characters.`,
    );
  }
  if (personLastName.length > PERSON_LAST_NAME_MAX_LENGTH) {
    throw new DomainException(
      `${label} must be at most ${PERSON_LAST_NAME_MAX_LENGTH} characters.`,
    );
  }

  return personLastName;
}
