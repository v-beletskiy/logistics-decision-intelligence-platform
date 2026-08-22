/** Returns whether an unknown value is a safe integer greater than zero. */
export function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
