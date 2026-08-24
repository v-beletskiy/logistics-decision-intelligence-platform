import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes.js";
import {
  isFiniteNumber,
  isPositiveFiniteNumber,
} from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../domain.exceptions.js";

/** Returns a finite number greater than zero or raises a domain error. */
export function requirePositiveFiniteNumber(
  value: unknown,
  label: string,
): number {
  if (!isFiniteNumber(value)) {
    throw new DomainException(
      `${label} must be a finite number.`,
      SHARED_DOMAIN_ERROR_CODES.invalidFiniteNumber,
    );
  }
  if (!isPositiveFiniteNumber(value)) {
    throw new DomainException(
      `${label} must be greater than zero.`,
      SHARED_DOMAIN_ERROR_CODES.nonPositiveNumber,
    );
  }
  return value;
}
