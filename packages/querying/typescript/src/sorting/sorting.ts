import { InvalidQueryError } from "../invalid-query.error.js";

export const SORT_DIRECTIONS = ["asc", "desc"] as const;

export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export class InvalidSortError extends InvalidQueryError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "query.sort-invalid", options);
  }
}

export function normalizeSortDirection(
  value: unknown,
  defaultDirection: SortDirection = "asc",
): SortDirection {
  if (value === undefined) return defaultDirection;
  if (value !== "asc" && value !== "desc") {
    throw new InvalidSortError("Sort direction is invalid.");
  }
  return value;
}
