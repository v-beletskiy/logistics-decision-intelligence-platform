import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes";
import { isFiniteNumber } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../domain.exceptions";

/** Returns a finite number or raises a domain error. */
export function requireFiniteNumber(value: unknown, label: string): number {
  if (!isFiniteNumber(value)) {
    throw new DomainException(
      `${label} must be a finite number.`,
      SHARED_DOMAIN_ERROR_CODES.invalidFiniteNumber,
    );
  }
  return value;
}
