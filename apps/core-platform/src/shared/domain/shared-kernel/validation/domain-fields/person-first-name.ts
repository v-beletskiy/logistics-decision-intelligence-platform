import { DomainException } from "../../domain.exceptions";
import { requireNonBlankString } from "../primitives/string/require-non-blank-string";

export const PERSON_FIRST_NAME_MIN_LENGTH = 1;
export const PERSON_FIRST_NAME_MAX_LENGTH = 100;

export function validatePersonFirstName(
  value: unknown,
  label: string = "first name",
): string {
  const personFirstName = requireNonBlankString(value, label);

  if (personFirstName.length < PERSON_FIRST_NAME_MIN_LENGTH) {
    throw new DomainException(
      `${label} must be not less than ${PERSON_FIRST_NAME_MIN_LENGTH} characters.`,
    );
  }
  if (personFirstName.length > PERSON_FIRST_NAME_MAX_LENGTH) {
    throw new DomainException(
      `${label} must be at most ${PERSON_FIRST_NAME_MAX_LENGTH} characters.`,
    );
  }

  return personFirstName;
}
