import { createHash } from "node:crypto";

import { InvalidPaginationError } from "./pagination.js";

const CURSOR_ENVELOPE_VERSION = 1 as const;

interface CursorEnvelope<TPosition> {
  readonly version: typeof CURSOR_ENVELOPE_VERSION;
  readonly scope: string;
  readonly position: TPosition;
}

export type CursorPositionParser<TPosition> = (value: unknown) => TPosition;

/** Binds a cursor to one query and its normalized effective criteria. */
export function createCursorScope(queryId: string, criteria: object): string {
  if (queryId.trim().length === 0) {
    throw new TypeError("Cursor query identifier must be specified.");
  }
  const digest = createHash("sha256")
    .update(JSON.stringify(canonicalize(criteria)))
    .digest("base64url");
  return `${queryId}:${digest}`;
}

export function encodeCursor<TPosition>(
  scope: string,
  position: TPosition,
): string {
  const envelope: CursorEnvelope<TPosition> = {
    version: CURSOR_ENVELOPE_VERSION,
    scope,
    position,
  };
  return Buffer.from(JSON.stringify(envelope), "utf8").toString("base64url");
}

export function decodeCursor<TPosition>(
  cursor: string,
  expectedScope: string,
  parseCursorPosition: CursorPositionParser<TPosition>,
): TPosition {
  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );
    if (!isRecord(decoded)) {
      throw new TypeError("Cursor envelope is not an object.");
    }
    if (
      decoded.version !== CURSOR_ENVELOPE_VERSION ||
      decoded.scope !== expectedScope
    ) {
      throw new TypeError("Cursor scope or format does not match.");
    }
    return parseCursorPosition(decoded.position);
  } catch (error: unknown) {
    throw new InvalidPaginationError(
      "Pagination cursor is invalid or does not match the current criteria.",
      { cause: error },
    );
  }
}

function canonicalize(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Cursor scope criteria must contain finite numbers.");
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  throw new TypeError("Cursor scope criteria must be JSON-compatible.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
