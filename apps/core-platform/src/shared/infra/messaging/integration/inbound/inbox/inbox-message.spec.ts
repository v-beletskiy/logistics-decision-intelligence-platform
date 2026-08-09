import * as assert from "node:assert/strict";
import { test } from "node:test";

import { inboxConsumerId } from "./inbox-message";

test("creates stable lowercase inbox consumer identifiers", () => {
  assert.equal(
    inboxConsumerId(
      "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
    ),
    "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
  );
});

test("rejects queue-like or unstable inbox consumer identifiers", () => {
  assert.throws(() => inboxConsumerId(""));
  assert.throws(() => inboxConsumerId("Decision Intelligence"));
  assert.throws(() => inboxConsumerId("decision_intelligence"));
});
