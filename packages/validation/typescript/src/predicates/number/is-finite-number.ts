/** Returns whether an unknown value is a finite JavaScript number. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
