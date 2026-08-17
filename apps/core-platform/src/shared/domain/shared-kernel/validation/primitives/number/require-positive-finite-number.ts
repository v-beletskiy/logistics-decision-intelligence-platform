import {
  isFiniteNumber,
  isPositiveFiniteNumber,
} from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../domain.exceptions';

/** Returns a finite number greater than zero or raises a domain error. */
export function requirePositiveFiniteNumber(
  value: unknown,
  label: string,
): number {
  if (!isFiniteNumber(value)) {
    throw new DomainException(`${label} must be a finite number.`);
  }
  if (!isPositiveFiniteNumber(value)) {
    throw new DomainException(`${label} must be greater than zero.`);
  }
  return value;
}
