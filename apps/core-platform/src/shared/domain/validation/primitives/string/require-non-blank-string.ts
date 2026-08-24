import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes.js";
import { isNonBlankString } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../domain.exceptions.js";

/** Returns a trimmed required string or raises a domain-level validation error. */
export function requireNonBlankString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new DomainException(
      `${label} must be text.`,
      SHARED_DOMAIN_ERROR_CODES.invalidText,
    );
  }
  if (!isNonBlankString(value)) {
    throw new DomainException(
      `${label} must be specified.`,
      SHARED_DOMAIN_ERROR_CODES.requiredValue,
    );
  }
  return value.trim();
}
