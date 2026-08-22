import * as assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import type { ConfirmChannel, ConsumeMessage } from "amqplib";
import { recommendationAnalysisCompletedV1 } from "@logistics-decision-intelligence/integration-event-contracts";

import type { AppConfig } from "../../../config/app-config";
import { inboxConsumerId } from "./inbox/inbox-message";
import type { InboxProcessor } from "./inbox/inbox-processor";
import type { RabbitMqConnection } from "../rabbitmq/connection";
import { IntegrationTopology } from "../rabbitmq/topology";
import { RabbitMqIntegrationEventConsumer } from "./rabbitmq-integration-event-consumer";
import type { RabbitMqTopologyProvisioner } from "../rabbitmq/topology-provisioner";
import { rabbitMqQueueName } from "./integration-subscription";

test("restores a subscription on a new dedicated channel after channel closure", async () => {
  const channels: ConfirmChannel[] = [];
  const subscribedQueues: string[] = [];
  const connection = {
    createConfirmChannel: async () => {
      const channel = createChannel(subscribedQueues, channels.length);
      channels.push(channel);
      return channel;
    },
  } as RabbitMqConnection;
  const consumer = new RabbitMqIntegrationEventConsumer(
    config(),
    connection,
    {} as InboxProcessor,
    topologyProvisioner(),
  );

  await consumer.subscribe({
    consumerId: inboxConsumerId(
      "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
    ),
    queue: rabbitMqQueueName(
      "core-platform.decision-intelligence.recommendation-analysis",
    ),
    contracts: [recommendationAnalysisCompletedV1],
    handle: async (event) => {
      const eventType: "recommendation-analysis.completed.v1" = event.type;
      const analysis: string = event.data.analysis;
      assert.equal(eventType, recommendationAnalysisCompletedV1.eventType);
      assert.equal(typeof analysis, "string");
    },
  });
  channels[0].emit("close");
  await waitUntil(() => channels.length === 2);

  assert.deepEqual(subscribedQueues, [
    "core-platform.decision-intelligence.recommendation-analysis",
    "core-platform.decision-intelligence.recommendation-analysis",
  ]);
  assert.notEqual(channels[0], channels[1]);

  await consumer.onModuleDestroy();
});

test("dead-letters oversized integration messages without scheduling a retry", async () => {
  let onMessage: ((message: ConsumeMessage | null) => void) | undefined;
  const nacks: Array<readonly [boolean, boolean]> = [];
  const emitter = new EventEmitter();
  const channel = Object.assign(emitter, {
    prefetch: async () => undefined,
    consume: async (
      _queue: string,
      callback: (message: ConsumeMessage | null) => void,
    ) => {
      onMessage = callback;
      return { consumerTag: "consumer-0" };
    },
    nack: (_message: unknown, allUpTo: boolean, requeue: boolean) => {
      nacks.push([allUpTo, requeue]);
    },
    cancel: async () => undefined,
    close: async () => {
      emitter.emit("close");
    },
  }) as unknown as ConfirmChannel;
  const consumer = new RabbitMqIntegrationEventConsumer(
    config(1),
    {
      createConfirmChannel: async () => channel,
    } as RabbitMqConnection,
    {} as InboxProcessor,
    topologyProvisioner(),
  );

  await consumer.subscribe({
    consumerId: inboxConsumerId(
      "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
    ),
    queue: rabbitMqQueueName(
      "core-platform.decision-intelligence.recommendation-analysis-completed",
    ),
    contracts: [recommendationAnalysisCompletedV1],
    handle: async () => undefined,
  });
  if (onMessage === undefined) throw new Error("Consumer was not registered.");

  onMessage({
    content: Buffer.from("{not-json"),
    properties: { headers: {}, messageId: "message-1" },
  } as never);
  await waitUntil(() => nacks.length === 1);

  assert.deepEqual(nacks, [[false, false]]);
  await consumer.onModuleDestroy();
});

test("schedules a retry only on the originating subscription's retry queue", async () => {
  let onMessage: ((message: ConsumeMessage | null) => void) | undefined;
  const sent: Array<{
    readonly queue: string;
    readonly options: {
      readonly expiration?: string;
      readonly headers?: Record<string, unknown>;
    };
  }> = [];
  let acknowledgements = 0;
  let confirms = 0;
  const emitter = new EventEmitter();
  const channel = Object.assign(emitter, {
    prefetch: async () => undefined,
    consume: async (
      _queue: string,
      callback: (message: ConsumeMessage | null) => void,
    ) => {
      onMessage = callback;
      return { consumerTag: "consumer-0" };
    },
    sendToQueue: (
      queue: string,
      _content: Buffer,
      options: {
        expiration?: string;
        headers?: Record<string, unknown>;
      },
    ) => {
      sent.push({ queue, options });
      return true;
    },
    waitForConfirms: async () => {
      confirms += 1;
    },
    ack: () => {
      acknowledgements += 1;
    },
    nack: () => {
      throw new Error(
        "A scheduled retry must acknowledge the original message.",
      );
    },
    cancel: async () => undefined,
    close: async () => {
      emitter.emit("close");
    },
  }) as unknown as ConfirmChannel;
  const consumer = new RabbitMqIntegrationEventConsumer(
    config(),
    {
      createConfirmChannel: async () => channel,
    } as RabbitMqConnection,
    {
      process: async () => {
        throw new Error("database unavailable");
      },
    } as unknown as InboxProcessor,
    topologyProvisioner(),
  );
  const queue = rabbitMqQueueName(
    "core-platform.decision-intelligence.recommendation-analysis-completed",
  );

  await consumer.subscribe({
    consumerId: inboxConsumerId(
      "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
    ),
    queue,
    contracts: [recommendationAnalysisCompletedV1],
    handle: async () => undefined,
  });
  if (onMessage === undefined) throw new Error("Consumer was not registered.");

  onMessage(validIntegrationMessage());
  await waitUntil(() => acknowledgements === 1);

  assert.equal(sent.length, 1);
  assert.equal(sent[0]?.queue, IntegrationTopology.retryQueueName(queue));
  assert.equal(sent[0]?.options.expiration, "1000");
  assert.equal(sent[0]?.options.headers?.["x-retry-count"], 1);
  assert.equal(confirms, 1);
  await consumer.onModuleDestroy();
});

test("rejects duplicate logical consumer and queue identities", async () => {
  const channels: ConfirmChannel[] = [];
  const connection = {
    createConfirmChannel: async () => {
      const channel = createChannel([], channels.length);
      channels.push(channel);
      return channel;
    },
  } as RabbitMqConnection;
  const consumer = new RabbitMqIntegrationEventConsumer(
    config(),
    connection,
    {} as InboxProcessor,
    topologyProvisioner(),
  );
  const consumerId = inboxConsumerId(
    "core-platform.decision-intelligence.recommendation-analysis-completed.v1",
  );
  const primaryQueue = rabbitMqQueueName(
    "core-platform.decision-intelligence.analysis-primary",
  );

  await consumer.subscribe({
    consumerId,
    queue: primaryQueue,
    contracts: [recommendationAnalysisCompletedV1],
    handle: async () => undefined,
  });
  await assert.rejects(
    consumer.subscribe({
      consumerId,
      queue: rabbitMqQueueName(
        "core-platform.decision-intelligence.analysis-secondary",
      ),
      contracts: [recommendationAnalysisCompletedV1],
      handle: async () => undefined,
    }),
    /already subscribed/,
  );
  await assert.rejects(
    consumer.subscribe({
      consumerId: inboxConsumerId(
        "core-platform.analytics.recommendation-analysis-completed.v1",
      ),
      queue: primaryQueue,
      contracts: [recommendationAnalysisCompletedV1],
      handle: async () => undefined,
    }),
    /already subscribed/,
  );

  await consumer.onModuleDestroy();
});

function createChannel(
  subscribedQueues: string[],
  index: number,
): ConfirmChannel {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    prefetch: async () => undefined,
    consume: async (queue: string) => {
      subscribedQueues.push(queue);
      return { consumerTag: `consumer-${index}` };
    },
    cancel: async () => undefined,
    close: async () => {
      emitter.emit("close");
    },
  }) as unknown as ConfirmChannel;
}

function config(maxIncomingMessageBytes = 1 * 1024 * 1024): AppConfig {
  return {
    messaging: {
      reconnectDelayMs: 1,
      retryBaseDelayMs: 1_000,
      maxDeliveryAttempts: 5,
      maxIncomingMessageBytes,
    },
  } as unknown as AppConfig;
}

function validIntegrationMessage(): ConsumeMessage {
  return {
    content: Buffer.from(
      JSON.stringify({
        specversion: "1.0",
        id: "7fd37f50-7510-41a4-a54c-51b1924530ed",
        source: "urn:logistics-decision-intelligence:recommendation-analysis",
        type: recommendationAnalysisCompletedV1.eventType,
        subject: "recommendation/9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
        time: "2026-08-01T00:00:00.000Z",
        dataschema: recommendationAnalysisCompletedV1.schemaId,
        tenantid: "e75a6194-423a-4e59-94f1-0876fc583a0b",
        data: {
          recommendationId: "9b9ed546-7999-4c07-a41a-4a75f1cdfb11",
          requestEventId: "8fd37f50-7510-41a4-a54c-51b1924530ed",
          analysis: "The route is feasible.",
        },
      }),
    ),
    properties: {
      contentType: "application/cloudevents+json",
      headers: {},
      messageId: "7fd37f50-7510-41a4-a54c-51b1924530ed",
    },
  } as ConsumeMessage;
}

function topologyProvisioner(): RabbitMqTopologyProvisioner {
  return {
    assertExchanges: async () => undefined,
    assertSubscription: async () => undefined,
  } as RabbitMqTopologyProvisioner;
}

async function waitUntil(condition: () => boolean): Promise<void> {
  const deadline = Date.now() + 1_000;
  while (!condition()) {
    if (Date.now() >= deadline) {
      throw new Error(
        "Timed out waiting for the RabbitMQ subscription restart.",
      );
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }
}
