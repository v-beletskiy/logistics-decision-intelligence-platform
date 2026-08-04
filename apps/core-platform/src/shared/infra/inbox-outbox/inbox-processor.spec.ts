import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { IntegrationEvent } from "../messaging/integration-event";
import { NonRetryableMessageException } from "../messaging/messaging.exceptions";
import type { TransactionManager } from "../persistence/transaction-manager";
import { InboxProcessor } from "./inbox-processor";
import type { InboxStore } from "./inbox-store";

const event: IntegrationEvent = {
  eventId: "7fd37f50-7510-41a4-a54c-51b1924530ed",
  eventType: "decision-intelligence.recommendation.analysis-completed.v1",
  eventVersion: 1,
  occurredAt: new Date("2026-08-01T00:00:00.000Z"),
  tenantId: "e75a6194-423a-4e59-94f1-0876fc583a0b",
  payload: { recommendationId: "recommendation-1" },
};

test("does not invoke a handler when the inbox already completed the event", async () => {
  let handled = false;
  const processor = new InboxProcessor(
    immediateTransactionManager(),
    fakeInboxStore(false),
  );

  await processor.process(event, async () => {
    handled = true;
  });

  assert.equal(handled, false);
});

test("acknowledges a deterministic consumer failure by completing the inbox record", async () => {
  const completed: string[] = [];
  const processor = new InboxProcessor(immediateTransactionManager(), {
    tryStart: async () => true,
    markCompleted: async (eventId: string) => {
      completed.push(eventId);
    },
  } as InboxStore);

  await processor.process(event, async () => {
    throw new NonRetryableMessageException(
      "The target recommendation no longer exists.",
    );
  });

  assert.deepEqual(completed, [event.eventId]);
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
