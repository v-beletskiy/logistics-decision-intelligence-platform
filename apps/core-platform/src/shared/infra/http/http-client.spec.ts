import * as assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { FetchHttpClient, HttpStatusError } from "./http-client.js";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = originalFetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("get returns the parsed JSON payload", async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, "http://example.test/data");
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const client = new FetchHttpClient();
  assert.deepEqual(await client.get("http://example.test/data"), {
    ok: true,
  });
});

test("post sends a JSON body", async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "http://example.test/optimize");
    assert.equal(init?.method, "POST");
    const headers = init?.headers as Record<string, string> | undefined;
    assert.equal(headers?.["content-type"], "application/json");
    assert.equal(init?.body, JSON.stringify({ jobs: [] }));
    return new Response(JSON.stringify({ code: "Ok" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const client = new FetchHttpClient();
  assert.deepEqual(
    await client.post("http://example.test/optimize", { jobs: [] }),
    {
      code: "Ok",
    },
  );
});

test("throws HttpStatusError on a non-OK response", async () => {
  globalThis.fetch = async () => new Response("nope", { status: 500 });

  const client = new FetchHttpClient();
  await assert.rejects(
    () => client.get("http://example.test/table"),
    (error: unknown) =>
      error instanceof HttpStatusError &&
      error.status === 500 &&
      error.message.includes("GET http://example.test/table"),
  );
});
