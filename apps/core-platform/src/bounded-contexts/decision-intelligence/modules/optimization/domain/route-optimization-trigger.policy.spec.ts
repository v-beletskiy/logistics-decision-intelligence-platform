import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RouteOptimizationTriggerPolicy } from "./route-optimization-trigger.policy.js";

test("optimizes when no previous optimization exists", () => {
  const policy = new RouteOptimizationTriggerPolicy();
  assert.equal(policy.shouldReoptimize({ currentInputVersion: 1 }), true);
});

test("re-optimizes when the input version advanced", () => {
  const policy = new RouteOptimizationTriggerPolicy();
  assert.equal(
    policy.shouldReoptimize({
      currentInputVersion: 4,
      previousInputVersion: 3,
    }),
    true,
  );
});

test("skips when the input version is unchanged", () => {
  const policy = new RouteOptimizationTriggerPolicy();
  assert.equal(
    policy.shouldReoptimize({
      currentInputVersion: 3,
      previousInputVersion: 3,
    }),
    false,
  );
});
