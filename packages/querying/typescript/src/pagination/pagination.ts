import { InvalidQueryError } from "../invalid-query.error.js";

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_MAX_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGE_NUMBER = 10_000;
export const MAX_CURSOR_LENGTH = 2_048;

export interface PagePaginationInput {
  readonly mode: "page";
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CursorPaginationInput {
  readonly mode: "cursor";
  readonly cursor?: string;
  readonly pageSize?: number;
}

export type PaginationInput = PagePaginationInput | CursorPaginationInput;

export interface PagePagination {
  readonly mode: "page";
  readonly page: number;
  readonly pageSize: number;
}

export interface CursorPagination {
  readonly mode: "cursor";
  readonly cursor?: string;
  readonly pageSize: number;
}

export type Pagination = PagePagination | CursorPagination;

export interface PageResult<T> {
  readonly mode: "page";
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface CursorPageResult<T> {
  readonly mode: "cursor";
  readonly items: readonly T[];
  readonly pageSize: number;
  readonly nextCursor?: string;
}

export type PaginationResult<T> = PageResult<T> | CursorPageResult<T>;

export interface PaginationOptions {
  readonly defaultPageSize?: number;
  readonly maxPageSize?: number;
  readonly maxPageNumber?: number;
  readonly maxCursorLength?: number;
}

export class InvalidPaginationError extends InvalidQueryError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "query.pagination-invalid", options);
  }
}

export function validatePagination(
  input: PagePaginationInput,
  options?: PaginationOptions,
): PagePagination;
export function validatePagination(
  input: CursorPaginationInput,
  options?: PaginationOptions,
): CursorPagination;
export function validatePagination(
  input: PaginationInput,
  options?: PaginationOptions,
): Pagination;
export function validatePagination(
  input: PaginationInput,
  options: PaginationOptions = {},
): Pagination {
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = options.maxPageSize ?? DEFAULT_MAX_PAGE_SIZE;
  const maxPageNumber = options.maxPageNumber ?? DEFAULT_MAX_PAGE_NUMBER;
  const maxCursorLength = options.maxCursorLength ?? MAX_CURSOR_LENGTH;
  assertPositiveInteger(defaultPageSize, "Default page size");
  assertPositiveInteger(maxPageSize, "Maximum page size");
  assertPositiveInteger(maxPageNumber, "Maximum page number");
  assertPositiveInteger(maxCursorLength, "Maximum cursor length");
  if (defaultPageSize > maxPageSize) {
    throw new TypeError(
      "Default page size cannot exceed the maximum page size.",
    );
  }

  const pageSize = input.pageSize ?? defaultPageSize;
  if (
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > maxPageSize
  ) {
    throw new InvalidPaginationError(
      `Page size must be an integer between 1 and ${maxPageSize}.`,
    );
  }

  if (input.mode === "cursor") {
    const cursor = input.cursor?.trim();
    if (cursor !== undefined && cursor.length > maxCursorLength) {
      throw new InvalidPaginationError(
        `Cursor must not exceed ${maxCursorLength} characters.`,
      );
    }
    return { mode: "cursor", pageSize, cursor: cursor || undefined };
  }

  const page = input.page ?? 1;
  if (!Number.isInteger(page) || page < 1 || page > maxPageNumber) {
    throw new InvalidPaginationError(
      `Page must be an integer between 1 and ${maxPageNumber}.`,
    );
  }
  return { mode: "page", page, pageSize };
}

export function pageOffset(pagination: PagePagination): number {
  return (pagination.page - 1) * pagination.pageSize;
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new TypeError(`${label} must be a positive integer.`);
  }
}
