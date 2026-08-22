import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes";
import { isPositiveSafeInteger } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../domain.exceptions";

/** Returns a positive integer or raises a domain error. */
export function requirePositiveSafeInteger(
  value: unknown,
  label: string,
): number {
  if (!isPositiveSafeInteger(value)) {
    throw new DomainException(
      `${label} must be a positive integer.`,
      SHARED_DOMAIN_ERROR_CODES.invalidPositiveSafeInteger,
    );
  }
  return value;
}
