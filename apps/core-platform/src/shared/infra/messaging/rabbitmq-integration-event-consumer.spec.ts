import * as assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import type { ConfirmChannel } from "amqplib";

import type { AppConfig } from "../config/app-config";
import type { InboxProcessor } from "../inbox-outbox/inbox-processor";
import type { RabbitMqConnection } from "./rabbitmq-connection";
import { RabbitMqIntegrationEventConsumer } from "./rabbitmq-integration-event-consumer";
import type { RabbitMqTopologyProvisioner } from "./rabbitmq-topology-provisioner";

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
    queue: "core-platform.decision-intelligence.recommendation-analysis",
    eventTypes: ["decision-intelligence.recommendation.analysis-completed"],
    handle: async () => undefined,
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

function config(): AppConfig {
  return {
    messaging: {
      reconnectDelayMs: 1,
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
