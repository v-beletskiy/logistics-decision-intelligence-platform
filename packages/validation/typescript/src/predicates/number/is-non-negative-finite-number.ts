import { isFiniteNumber } from './is-finite-number';

/** Returns whether an unknown value is a finite number greater than or equal to zero. */
export function isNonNegativeFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}
