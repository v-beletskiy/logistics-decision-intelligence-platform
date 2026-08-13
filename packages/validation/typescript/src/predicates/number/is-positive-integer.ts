import { isFiniteNumber } from './is-finite-number';

/** Returns whether an unknown value is a finite integer greater than zero. */
export function isPositiveInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value > 0;
}
