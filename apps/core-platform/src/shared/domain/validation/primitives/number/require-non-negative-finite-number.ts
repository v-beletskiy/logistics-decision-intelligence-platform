import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes";
import {
  isFiniteNumber,
  isNonNegativeFiniteNumber,
} from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../domain.exceptions";

/** Returns a finite number greater than or equal to zero or raises a domain error. */
export function requireNonNegativeFiniteNumber(
  value: unknown,
  label: string,
): number {
  if (!isFiniteNumber(value)) {
    throw new DomainException(
      `${label} must be a finite number.`,
      SHARED_DOMAIN_ERROR_CODES.invalidFiniteNumber,
    );
  }
  if (!isNonNegativeFiniteNumber(value)) {
    throw new DomainException(
      `${label} cannot be negative.`,
      SHARED_DOMAIN_ERROR_CODES.negativeNumber,
    );
  }
  return value;
}
