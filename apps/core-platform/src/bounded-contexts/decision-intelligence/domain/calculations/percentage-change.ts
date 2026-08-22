/** Signed relative change from `baseline` to `value`, as a percentage. */
export function percentageChange(value: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((value - baseline) / baseline) * 100;
}
