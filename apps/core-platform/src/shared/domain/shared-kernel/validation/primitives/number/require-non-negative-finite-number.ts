import {
  isFiniteNumber,
  isNonNegativeFiniteNumber,
} from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../exceptions/domain.exception';

/** Returns a finite number greater than or equal to zero or raises a domain error. */
export function requireNonNegativeFiniteNumber(
  value: unknown,
  label: string,
): number {
  if (!isFiniteNumber(value)) {
    throw new DomainException(`${label} must be a finite number.`);
  }
  if (!isNonNegativeFiniteNumber(value)) {
    throw new DomainException(`${label} cannot be negative.`);
  }
  return value;
}
