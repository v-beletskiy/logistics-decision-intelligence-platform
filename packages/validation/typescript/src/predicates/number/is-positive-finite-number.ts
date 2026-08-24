import { isFiniteNumber } from "./is-finite-number.js";

/** Returns whether an unknown value is a finite number greater than zero. */
export function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}
