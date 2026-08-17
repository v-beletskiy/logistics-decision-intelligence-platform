import { isUuid } from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../domain.exceptions';

/** Returns a UUID string or raises a domain-level validation error. */
export function requireUuid(value: unknown, label: string): string {
  if (!isUuid(value)) {
    throw new DomainException(`${label} must be a valid UUID.`);
  }
  return value;
}
