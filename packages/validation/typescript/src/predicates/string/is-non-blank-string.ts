/** Returns whether an unknown value is a string containing non-whitespace characters. */
export function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
