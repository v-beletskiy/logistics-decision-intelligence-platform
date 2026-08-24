import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes.js";
import { DomainException } from "../../../domain.exceptions.js";

/** Returns a trimmed optional string, treating blank text as absent. */
export function optionalTrimmedString(
  value: unknown,
  label: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new DomainException(
      `${label} must be text when specified.`,
      SHARED_DOMAIN_ERROR_CODES.invalidOptionalText,
    );
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}
