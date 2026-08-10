import * as assert from "node:assert/strict";
import { test } from "node:test";
import { recommendationAnalysisRequestedV1 } from "@logistics-decision-intelligence/integration-contracts";
import { IntegrationEventFactory } from "@logistics-decision-intelligence/integration-events";

import type { OutboxStore } from "./outbox-store";
import { TransactionalOutboxIntegrationEventPublisher } from "./transactional-outbox-integration-event-publisher";

const decisionIntelligenceEvents = new IntegrationEventFactory(
  "urn:logistics-decision-intelligence:decision-intelligence",
);

test("rejects an invalid producer event before it enters the outbox", async () => {
  let enqueued = 0;
  const publisher = new TransactionalOutboxIntegrationEventPublisher(
    {
      enqueue: async () => {
        enqueued += 1;
      },
    } as unknown as OutboxStore,
    { messaging: { maxOutgoingMessageBytes: 1_048_576 } } as never,
  );
  const event = decisionIntelligenceEvents.create(
    recommendationAnalysisRequestedV1,
    {
      tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
      subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      data: {
        recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
        routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
      },
    },
  );

  await publisher.publish(event);
  await assert.rejects(
    publisher.publish({ ...event, data: {} }),
    /Integration event validation failed/,
  );

  assert.equal(enqueued, 1);
});

test("rejects an oversized producer event before it enters the outbox", async () => {
  let enqueued = 0;
  const publisher = new TransactionalOutboxIntegrationEventPublisher(
    {
      enqueue: async () => {
        enqueued += 1;
      },
    } as unknown as OutboxStore,
    { messaging: { maxOutgoingMessageBytes: 1 } } as never,
  );
  const event = decisionIntelligenceEvents.create(
    recommendationAnalysisRequestedV1,
    {
      tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
      subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
      data: {
        recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
        routeId: "1fb2cb00-84f4-43ef-94d0-f5c1cf4ba597",
      },
    },
  );

  await assert.rejects(
    publisher.publish(event),
    /outgoing message size limit/,
  );
  assert.equal(enqueued, 0);
});
