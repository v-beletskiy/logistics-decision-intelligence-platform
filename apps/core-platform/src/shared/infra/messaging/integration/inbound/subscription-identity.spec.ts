import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  integrationSubscriptionIdentity,
  rabbitMqQueueName,
} from "./subscription-identity";

test("defines a stable integration-subscription identity", () => {
  const identity = integrationSubscriptionIdentity({
    consumerId:
      "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
    queue:
      "core-platform.decision-intelligence.recommendation-analysis-completed",
  });

  assert.equal(
    identity.consumerId,
    "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
  );
  assert.equal(
    identity.queue,
    "core-platform.decision-intelligence.recommendation-analysis-completed",
  );
});

test("rejects unstable RabbitMQ queue names", () => {
  assert.throws(() => rabbitMqQueueName("Queue/Completed"));
  assert.throws(() => rabbitMqQueueName("queue..completed"));
  assert.throws(() => rabbitMqQueueName("q".repeat(201)));
});
