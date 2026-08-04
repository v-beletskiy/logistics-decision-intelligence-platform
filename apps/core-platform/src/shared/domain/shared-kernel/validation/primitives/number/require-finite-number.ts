import { isFiniteNumber } from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../exceptions/domain.exception';

/** Returns a finite number or raises a domain error. */
export function requireFiniteNumber(value: unknown, label: string): number {
  if (!isFiniteNumber(value)) {
    throw new DomainException(`${label} must be a finite number.`);
  }
  return value;
}
