import * as assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import type { ConfirmChannel, ConsumeMessage } from "amqplib";
import { recommendationAnalysisCompletedV1 } from "@logistics-decision-intelligence/integration-contracts";

import type { AppConfig } from "../../../config/app-config";
import { inboxConsumerId } from "./inbox/inbox-message";
import type { InboxProcessor } from "./inbox/inbox-processor";
import type { RabbitMqConnection } from "../rabbitmq/connection";
import { RabbitMqIntegrationEventConsumer } from "./rabbitmq-integration-event-consumer";
import type { RabbitMqTopologyProvisioner } from "../rabbitmq/topology-provisioner";

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
    queue: "core-platform.decision-intelligence.recommendation-analysis",
    eventContracts: [recommendationAnalysisCompletedV1],
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
    queue: "core-platform.decision-intelligence.recommendation-analysis-completed",
    eventContracts: [recommendationAnalysisCompletedV1],
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

test("rejects reusing one logical inbox consumer identity for two subscriptions", async () => {
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

  await consumer.subscribe({
    consumerId,
    queue: "core-platform.decision-intelligence.analysis-primary",
    eventContracts: [recommendationAnalysisCompletedV1],
    handle: async () => undefined,
  });
  await assert.rejects(
    consumer.subscribe({
      consumerId,
      queue: "core-platform.decision-intelligence.analysis-secondary",
      eventContracts: [recommendationAnalysisCompletedV1],
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
      maxIncomingMessageBytes,
    },
  } as unknown as AppConfig;
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
