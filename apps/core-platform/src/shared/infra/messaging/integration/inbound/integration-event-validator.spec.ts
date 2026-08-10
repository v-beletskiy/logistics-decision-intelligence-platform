import * as assert from "node:assert/strict";
import { test } from "node:test";

import { recommendationAnalysisCompletedV1 } from "@logistics-decision-intelligence/integration-contracts";

import {
  IntegrationEventValidator,
  InvalidIntegrationEventException,
} from "./integration-event-validator";

test("validates a complete versioned CloudEvents integration event", () => {
  const validator = new IntegrationEventValidator([
    recommendationAnalysisCompletedV1,
  ]);

  const event = validator.parse(validEvent());
  const eventType: "recommendation-analysis.completed.v1" = event.type;

  assert.equal(eventType, recommendationAnalysisCompletedV1.eventType);
  assert.equal(event.time, "2026-08-08T10:30:00.000Z");
  assert.deepEqual(event.data, {
    recommendationId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
    requestEventId: "8cdb1b5f-89f7-4b51-8175-9c22dd9a4c45",
    analysis: "The revised route avoids the predicted delay.",
  });
});

test("rejects malformed envelopes and payloads as non-retryable", () => {
  const validator = new IntegrationEventValidator([
    recommendationAnalysisCompletedV1,
  ]);

  assert.throws(
    () => validator.parse({ ...validEvent(), tenantid: "not-a-uuid" }),
    InvalidIntegrationEventException,
  );
  assert.throws(
    () => validator.parse({ ...validEvent(), data: {} }),
    InvalidIntegrationEventException,
  );
  assert.throws(
    () => validator.parse({ ...validEvent(), unexpected: true }),
    InvalidIntegrationEventException,
  );
});

test("rejects unknown event versions through the versioned event type", () => {
  const validator = new IntegrationEventValidator([
    recommendationAnalysisCompletedV1,
  ]);

  assert.throws(
    () =>
      validator.parse({
        ...validEvent(),
        type: "recommendation-analysis.completed.v2",
      }),
    InvalidIntegrationEventException,
  );
});

function validEvent(): Record<string, unknown> {
  return {
    specversion: "1.0",
    id: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    source: "urn:logistics-decision-intelligence:recommendation-analysis",
    type: recommendationAnalysisCompletedV1.eventType,
    subject: "recommendation/1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
    time: "2026-08-08T10:30:00.000Z",
    dataschema: recommendationAnalysisCompletedV1.schemaId,
    tenantid: "2c2dd26e-dfc6-4d80-9e35-b3111b9d3e1a",
    data: {
      recommendationId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
      requestEventId: "8cdb1b5f-89f7-4b51-8175-9c22dd9a4c45",
      analysis: "The revised route avoids the predicted delay.",
    },
  };
}
