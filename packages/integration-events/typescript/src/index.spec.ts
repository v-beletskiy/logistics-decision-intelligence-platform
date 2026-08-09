import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  integrationEventEnvelopeV1Schema,
  recommendationAnalysisCompletedV1,
  recommendationAnalysisRequestedV1,
} from "@logistics-decision-intelligence/integration-contracts";

import {
  createIntegrationEvent,
  IntegrationEventDecoder,
  IntegrationEventValidationError,
} from "./index";

const decoder = new IntegrationEventDecoder([
  recommendationAnalysisRequestedV1,
]);

test("creates and decodes a versioned CloudEvents JSON contract", () => {
  const event = createIntegrationEvent(
    recommendationAnalysisRequestedV1,
    {
      source:
        "urn:logistics-decision-intelligence:core-platform:decision-intelligence",
      tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
      subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      data: {
        recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
        routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
      },
    },
    {
      id: "7fd37f50-7510-41a4-a54c-51b1924530ed",
      time: "2026-08-01T00:00:00.000Z",
    },
  );

  assert.equal(event.specversion, "1.0");
  assert.equal(
    event.type,
    "decision-intelligence.recommendation-analysis-requested.v1",
  );
  const eventType: "decision-intelligence.recommendation-analysis-requested.v1" =
    event.type;
  const decoded = decoder.parse(event);
  const routeId: string = decoded.data.routeId;

  assert.equal(eventType, event.type);
  assert.equal(routeId, event.data.routeId);
  assert.deepEqual(decoded, event);
});

test("rejects unknown contracts and schema mismatches", () => {
  const event = createIntegrationEvent(recommendationAnalysisRequestedV1, {
    source:
      "urn:logistics-decision-intelligence:core-platform:decision-intelligence",
    tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
    subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    data: {
      recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
    },
  });
  assert.throws(
    () =>
      decoder.parse({
        ...event,
        type: "other.event.created.v1",
      }),
    IntegrationEventValidationError,
  );
  assert.throws(
    () =>
      decoder.parse({
        ...event,
        dataschema: "urn:other",
      }),
    IntegrationEventValidationError,
  );
});

test("requires the lean CloudEvents profile", () => {
  assert.equal(
    integrationEventEnvelopeV1Schema.$id,
    "urn:logistics-decision-intelligence:integration-event-envelope:v1",
  );
  const event = createIntegrationEvent(recommendationAnalysisRequestedV1, {
    source:
      "urn:logistics-decision-intelligence:core-platform:decision-intelligence",
    tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
    subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    data: {
      recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
    },
  });

  assert.equal("datacontenttype" in event, false);
  assert.equal("initiatedbyuserid" in event, false);
});

test("decodes the AI Platform analysis completion contract", () => {
  const decoder = new IntegrationEventDecoder([
    recommendationAnalysisCompletedV1,
  ]);
  const event = createIntegrationEvent(recommendationAnalysisCompletedV1, {
    source:
      "urn:logistics-decision-intelligence:ai-platform:recommendation-analysis",
    tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
    subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    data: {
      recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      requestEventId: "7fd37f50-7510-41a4-a54c-51b1924530ed",
      analysis: "The proposed route reduces the estimated delay.",
    },
  });

  assert.deepEqual(decoder.parse(event), event);
});

test("keeps payloads correlated with event types across a contract union", () => {
  const unionDecoder = new IntegrationEventDecoder([
    recommendationAnalysisRequestedV1,
    recommendationAnalysisCompletedV1,
  ]);
  const event = createIntegrationEvent(recommendationAnalysisRequestedV1, {
    source:
      "urn:logistics-decision-intelligence:core-platform:decision-intelligence",
    tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
    subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
    data: {
      recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
    },
  });

  const decoded = unionDecoder.parse(event);
  if (
    decoded.type ===
    "decision-intelligence.recommendation-analysis-requested.v1"
  ) {
    const routeId: string = decoded.data.routeId;
    assert.equal(routeId, event.data.routeId);
  } else {
    const analysis: string = decoded.data.analysis;
    assert.equal(typeof analysis, "string");
  }
});
