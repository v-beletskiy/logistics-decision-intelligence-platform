import { isNonBlankString } from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../exceptions/domain.exception';

/** Returns a trimmed required string or raises a domain-level validation error. */
export function requireNonBlankString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new DomainException(`${label} must be text.`);
  }
  if (!isNonBlankString(value)) {
    throw new DomainException(`${label} must be specified.`);
  }
  return value.trim();
}
