/**
 * Trims a string and converts a blank result to undefined.
 *
 * The caller decides whether an absent result is permitted.
 */
export function trimBlankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}
