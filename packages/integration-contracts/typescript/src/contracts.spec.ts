import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  integrationEventEnvelopeV1Schema,
  recommendationAnalysisCompletedV1,
  recommendationAnalysisRequestedV1,
} from "./index";

test("published integration contracts have unique event types and schema identifiers", () => {
  const requestedEventType: "decision-intelligence.recommendation-analysis-requested.v1" =
    recommendationAnalysisRequestedV1.eventType;
  const completedEventType: "recommendation-analysis.completed.v1" =
    recommendationAnalysisCompletedV1.eventType;

  assert.equal(requestedEventType, recommendationAnalysisRequestedV1.eventType);
  assert.equal(completedEventType, recommendationAnalysisCompletedV1.eventType);

  const eventTypes = new Set<string>();
  const schemaIds = new Set<string>();
  for (const contract of [
    recommendationAnalysisRequestedV1,
    recommendationAnalysisCompletedV1,
  ]) {
    assert.match(contract.eventType, /\.v[1-9][0-9]*$/);
    assert.ok(!eventTypes.has(contract.eventType));
    assert.ok(!schemaIds.has(contract.schemaId));
    assert.equal(contract.schemaId, contract.payloadSchema.$id);
    eventTypes.add(contract.eventType);
    schemaIds.add(contract.schemaId);
  }
  assert.equal(
    integrationEventEnvelopeV1Schema.$id,
    "urn:logistics-decision-intelligence:integration-event-envelope:v1",
  );
});
