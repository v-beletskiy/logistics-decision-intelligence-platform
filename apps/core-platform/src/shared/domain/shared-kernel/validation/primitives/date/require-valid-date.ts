import { DomainException } from '../../../domain.exceptions';

/** Returns a defensive copy of a valid Date or raises a domain error. */
export function requireValidDate(value: unknown, label: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainException(`${label} must be a valid date.`);
  }
  return new Date(value);
}
