import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { ConfirmChannel } from "amqplib";

import type { AppConfig } from "../config/app-config";
import type { IntegrationEvent } from "../messaging/integration-event";
import type { RabbitMqConnection } from "../messaging/rabbitmq-connection";
import type { RabbitMqTopologyProvisioner } from "../messaging/rabbitmq-topology-provisioner";
import type { ClaimedOutboxEvent } from "./outbox-store";
import type { OutboxStore } from "./outbox-store";
import { RabbitMqOutboxPublisher } from "./rabbitmq-outbox-publisher";

test("claims consecutive PostgreSQL batches and confirms each RabbitMQ batch once", async () => {
  const pages = [[claim("event-1"), claim("event-2")], [claim("event-3")]];
  const claimLimits: number[] = [];
  const published: string[] = [];
  const marked: string[] = [];
  let confirms = 0;

  const publisher = new RabbitMqOutboxPublisher(
    config(),
    {
      enqueue: async () => undefined,
      claimPendingBatch: async (limit: number) => {
        claimLimits.push(limit);
        return pages.shift() ?? [];
      },
      markPublished: async (eventId: string) => {
        marked.push(eventId);
        return true;
      },
      reschedule: async () => true,
    } as OutboxStore,
    connection({
      publish: (_exchange: string, _routingKey: string, content: Buffer) => {
        published.push(
          (JSON.parse(content.toString()) as IntegrationEvent).eventId,
        );
        return true;
      },
      waitForConfirms: async () => {
        confirms += 1;
      },
    }),
    topologyProvisioner(),
  );

  const result = await publisher.publishPending();

  assert.deepEqual(claimLimits, [2, 2]);
  assert.deepEqual(published, ["event-1", "event-2", "event-3"]);
  assert.deepEqual(marked, ["event-1", "event-2", "event-3"]);
  assert.equal(confirms, 2);
  assert.deepEqual(result, {
    batchesProcessed: 2,
    itemsProcessed: 3,
    reachedBatchLimit: false,
  });
});

test("reschedules the claimed batch and stops draining when confirms fail", async () => {
  const pages = [[claim("event-1"), claim("event-2")], [claim("event-3")]];
  const rescheduled: string[] = [];
  let loads = 0;

  const publisher = new RabbitMqOutboxPublisher(
    config(),
    {
      enqueue: async () => undefined,
      claimPendingBatch: async () => {
        loads += 1;
        return pages.shift() ?? [];
      },
      markPublished: async () => {
        throw new Error("must not mark an unconfirmed event");
      },
      reschedule: async (eventId: string) => {
        rescheduled.push(eventId);
        return true;
      },
    } as OutboxStore,
    connection({
      publish: () => true,
      waitForConfirms: async () => {
        throw new Error("broker channel closed");
      },
    }),
    topologyProvisioner(),
  );

  await assert.rejects(publisher.publishPending(), /broker channel closed/);

  assert.equal(loads, 1);
  assert.deepEqual(rescheduled, ["event-1", "event-2"]);
});

test("continues immediately when a bounded drain ends with a full batch", async () => {
  const pages = [[claim("event-1"), claim("event-2")], [claim("event-3")]];
  let loads = 0;
  let complete!: () => void;
  const completed = new Promise<void>((resolve) => {
    complete = resolve;
  });

  const publisher = new RabbitMqOutboxPublisher(
    config(1),
    {
      enqueue: async () => undefined,
      claimPendingBatch: async () => {
        loads += 1;
        return pages.shift() ?? [];
      },
      markPublished: async (eventId: string) => {
        if (eventId === "event-3") {
          complete();
        }
        return true;
      },
      reschedule: async () => true,
    } as OutboxStore,
    connection({
      publish: () => true,
      waitForConfirms: async () => undefined,
    }),
    topologyProvisioner(),
  );

  publisher.onModuleInit();
  try {
    await withTimeout(completed, 1_000);
  } finally {
    await publisher.onModuleDestroy();
  }

  assert.equal(loads, 2);
});

function config(outboxMaxBatchesPerDrain = 10): AppConfig {
  return {
    messaging: {
      retryBaseDelayMs: 1_000,
      outboxBatchSize: 2,
      outboxMaxBatchesPerDrain,
      outboxPollIntervalMs: 5_000,
    },
  } as unknown as AppConfig;
}

function claim(eventId: string): ClaimedOutboxEvent {
  return {
    event: {
      eventId,
      eventType: "test.event.v1",
      eventVersion: 1,
      occurredAt: new Date("2026-08-03T00:00:00.000Z"),
      tenantId: "e75a6194-423a-4e59-94f1-0876fc583a0b",
      payload: {},
    },
    lockToken: `lock-${eventId}`,
  };
}

function connection(
  channel: Pick<ConfirmChannel, "publish" | "waitForConfirms">,
): RabbitMqConnection {
  const completeChannel = {
    ...channel,
    close: async () => undefined,
    on: () => completeChannel,
    once: () => completeChannel,
  } as unknown as ConfirmChannel;
  return {
    createConfirmChannel: async () => completeChannel,
  } as RabbitMqConnection;
}

function topologyProvisioner(): RabbitMqTopologyProvisioner {
  return {
    assertExchanges: async () => undefined,
    assertSubscription: async () => undefined,
  } as RabbitMqTopologyProvisioner;
}

async function withTimeout(operation: Promise<void>, timeoutMs: number) {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error("Timed out waiting for the outbox drain.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
