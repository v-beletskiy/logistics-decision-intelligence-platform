/** Constraints applied while parsing an absolute URL. */
export interface ParseUrlOptions {
  readonly allowedProtocols?: readonly string[];
  readonly forbidCredentials?: boolean;
  readonly forbidQuery?: boolean;
  readonly forbidFragment?: boolean;
}

/** A stable reason why URL parsing or its requested constraints failed. */
export type UrlParseFailureReason =
  | "invalid"
  | "protocol-not-allowed"
  | "credentials-not-allowed"
  | "query-not-allowed"
  | "fragment-not-allowed";

/** The result of parsing an absolute URL without throwing. */
export type UrlParseResult =
  | { readonly ok: true; readonly value: URL }
  | { readonly ok: false; readonly reason: UrlParseFailureReason };

/** Parses an absolute URL and applies reusable transport-level constraints. */
export function parseUrl(
  value: unknown,
  options: ParseUrlOptions = {},
): UrlParseResult {
  if (typeof value !== "string") return { ok: false, reason: "invalid" };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (
    options.allowedProtocols !== undefined &&
    !options.allowedProtocols.includes(url.protocol)
  ) {
    return { ok: false, reason: "protocol-not-allowed" };
  }
  if (options.forbidCredentials && (url.username || url.password)) {
    return { ok: false, reason: "credentials-not-allowed" };
  }
  if (options.forbidQuery && url.search) {
    return { ok: false, reason: "query-not-allowed" };
  }
  if (options.forbidFragment && url.hash) {
    return { ok: false, reason: "fragment-not-allowed" };
  }

  return { ok: true, value: url };
}
