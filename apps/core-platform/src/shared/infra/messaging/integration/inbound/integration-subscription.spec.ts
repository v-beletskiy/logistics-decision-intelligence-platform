import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  defineSubscription,
  rabbitMqQueueName,
} from "./integration-subscription";
import { recommendationAnalysisCompletedV1 } from "@logistics-decision-intelligence/integration-event-contracts";

test("defines a stable integration-subscription identity", () => {
  const subscription = defineSubscription({
    consumerId:
      "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
    queue:
      "core-platform.decision-intelligence.recommendation-analysis-completed",
    contracts: [recommendationAnalysisCompletedV1],
  });

  assert.equal(
    subscription.consumerId,
    "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
  );
  assert.equal(
    subscription.queue,
    "core-platform.decision-intelligence.recommendation-analysis-completed",
  );
});

test("rejects empty and duplicate contract sets", () => {
  const input = {
    consumerId: "core-platform.consumer.v1",
    queue: "core-platform.consumer",
  };
  assert.throws(() => defineSubscription({ ...input, contracts: [] }));
  assert.throws(() =>
    defineSubscription({
      ...input,
      contracts: [
        recommendationAnalysisCompletedV1,
        recommendationAnalysisCompletedV1,
      ],
    }),
  );
});

test("rejects unstable RabbitMQ queue names", () => {
  assert.throws(() => rabbitMqQueueName("Queue/Completed"));
  assert.throws(() => rabbitMqQueueName("queue..completed"));
  assert.throws(() => rabbitMqQueueName("q".repeat(201)));
});
