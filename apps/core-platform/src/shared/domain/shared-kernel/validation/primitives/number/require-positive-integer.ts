import { isPositiveInteger } from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../domain.exceptions';

/** Returns a positive integer or raises a domain error. */
export function requirePositiveInteger(value: unknown, label: string): number {
  if (!isPositiveInteger(value)) {
    throw new DomainException(`${label} must be a positive integer.`);
  }
  return value;
}
