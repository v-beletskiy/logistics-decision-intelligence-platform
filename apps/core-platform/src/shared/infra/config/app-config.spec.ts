import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseProcessRoles } from "./app-config";

test("defaults process roles to api", () => {
  assert.deepEqual(parseProcessRoles(undefined), ["api"]);
});

test("parses comma-separated process roles", () => {
  assert.deepEqual(parseProcessRoles("api, outbox-publisher"), [
    "api",
    "outbox-publisher",
  ]);
});

test("rejects unsupported and duplicate process roles", () => {
  assert.throws(() => parseProcessRoles("api, scheduler"), /unsupported role/);
  assert.throws(() => parseProcessRoles("api, api"), /duplicate role/);
});
