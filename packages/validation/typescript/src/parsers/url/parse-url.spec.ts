import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseUrl } from "./parse-url.js";

test("parses absolute URLs", () => {
  const result = parseUrl("https://example.com/path");

  assert.equal(result.ok, true);
  if (!result.ok) assert.fail("Expected a parsed URL.");
  assert.equal(result.value.href, "https://example.com/path");
});

test("reports malformed and non-string URL values", () => {
  assert.deepEqual(parseUrl("not a URL"), {
    ok: false,
    reason: "invalid",
  });
  assert.deepEqual(parseUrl(undefined), { ok: false, reason: "invalid" });
});

test("applies protocol constraints", () => {
  assert.deepEqual(
    parseUrl("ftp://example.com", { allowedProtocols: ["https:"] }),
    { ok: false, reason: "protocol-not-allowed" },
  );
});

test("applies credential, query, and fragment constraints", () => {
  const options = {
    forbidCredentials: true,
    forbidQuery: true,
    forbidFragment: true,
  };

  assert.deepEqual(parseUrl("https://user@example.com", options), {
    ok: false,
    reason: "credentials-not-allowed",
  });
  assert.deepEqual(parseUrl("https://example.com?source=test", options), {
    ok: false,
    reason: "query-not-allowed",
  });
  assert.deepEqual(parseUrl("https://example.com#section", options), {
    ok: false,
    reason: "fragment-not-allowed",
  });
});
