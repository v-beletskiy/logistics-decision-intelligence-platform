import { requireValidDate } from "./require-valid-date";

/** Returns no value or a defensive copy of a valid Date. */
export function optionalValidDate(
  value: unknown,
  label: string,
): Date | undefined {
  return value === undefined ? undefined : requireValidDate(value, label);
}
