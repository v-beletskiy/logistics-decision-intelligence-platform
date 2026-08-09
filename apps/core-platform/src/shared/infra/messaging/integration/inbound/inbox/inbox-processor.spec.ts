import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  integrationEventId,
  type CloudEvent,
} from "@logistics-decision-intelligence/integration-events";
import type { TransactionManager } from "../../../../persistence/transaction-manager";
import { NonRetryableMessageException } from "../../errors";
import { InboxProcessor } from "./inbox-processor";
import type { InboxStore } from "./inbox-store";
import {
  inboxConsumerId,
  type InboxMessage,
  type InboxMessageKey,
} from "./inbox-message";

const event: CloudEvent = {
  specversion: "1.0",
  id: integrationEventId("7fd37f50-7510-41a4-a54c-51b1924530ed"),
  source: "urn:logistics-decision-intelligence:test",
  type: "recommendation-analysis.completed.v1",
  subject: "recommendation/recommendation-1",
  time: "2026-08-01T00:00:00.000Z",
  dataschema: "urn:logistics-decision-intelligence:test:event:v1",
  tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
  data: { recommendationId: "recommendation-1" },
};

test("does not invoke a handler when the inbox already completed the event", async () => {
  let handled = false;
  const processor = new InboxProcessor(
    immediateTransactionManager(),
    fakeInboxStore(false),
  );

  await processor.process(
    inboxConsumerId("decision-intelligence.analysis-completed"),
    event,
    async () => {
      handled = true;
    },
  );

  assert.equal(handled, false);
});

test("acknowledges a deterministic consumer failure by completing the inbox record", async () => {
  const completed: string[] = [];
  const processor = new InboxProcessor(immediateTransactionManager(), {
    tryStart: async () => true,
    markCompleted: async (message: InboxMessageKey) => {
      completed.push(message.eventId);
    },
  } as InboxStore);

  await processor.process(
    inboxConsumerId("decision-intelligence.analysis-completed"),
    event,
    async () => {
      throw new NonRetryableMessageException(
        "The target recommendation no longer exists.",
      );
    },
  );

  assert.deepEqual(completed, [event.id]);
});

test("uses the consumer name as part of the idempotency identity", async () => {
  const started: string[] = [];
  const processor = new InboxProcessor(immediateTransactionManager(), {
    tryStart: async (message: InboxMessage) => {
      started.push(message.consumerId);
      return true;
    },
    markCompleted: async () => undefined,
  } as InboxStore);
  let handled = 0;

  await processor.process(
    inboxConsumerId("analytics.route-projection"),
    event,
    async () => {
      handled += 1;
    },
  );
  await processor.process(
    inboxConsumerId("recommendations.route-projection"),
    event,
    async () => {
      handled += 1;
    },
  );

  assert.equal(handled, 2);
  assert.deepEqual(started, [
    "analytics.route-projection",
    "recommendations.route-projection",
  ]);
});

function immediateTransactionManager(): TransactionManager {
  return {
    run: async <TResult>(operation: () => Promise<TResult>): Promise<TResult> =>
      operation(),
  } as TransactionManager;
}

function fakeInboxStore(started: boolean): InboxStore {
  return {
    tryStart: async () => started,
    markCompleted: async () => undefined,
  } as InboxStore;
}
