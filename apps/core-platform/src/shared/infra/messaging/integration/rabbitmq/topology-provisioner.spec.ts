import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { Channel } from "amqplib";

import { IntegrationTopology } from "./topology";
import { RabbitMqTopologyProvisioner } from "./topology-provisioner";

test("declares integration exchanges", async () => {
  const exchanges: Array<readonly [string, string, boolean]> = [];
  const channel = {
    assertExchange: async (
      name: string,
      type: string,
      options: { durable?: boolean },
    ) => {
      exchanges.push([name, type, options.durable === true]);
      return { exchange: name };
    },
  } as unknown as Channel;

  await new RabbitMqTopologyProvisioner().assertExchanges(channel);

  assert.deepEqual(exchanges, [
    [IntegrationTopology.exchanges.integration.name, "topic", true],
    [IntegrationTopology.exchanges.deadLetter.name, "topic", true],
  ]);
});

test("isolates each subscription's retry and dead-letter queues", async () => {
  const queueArguments = new Map<string, Record<string, unknown> | undefined>();
  const bindings: Array<readonly [string, string, string]> = [];
  const channel = {
    assertExchange: async (name: string) => ({ exchange: name }),
    assertQueue: async (
      name: string,
      options: { arguments?: Record<string, unknown> },
    ) => {
      queueArguments.set(name, options.arguments);
      return { queue: name };
    },
    bindQueue: async (queue: string, exchange: string, routingKey: string) => {
      bindings.push([queue, exchange, routingKey]);
      return {};
    },
  } as unknown as Channel;
  const firstQueueName =
    "core-platform.decision-intelligence.recommendation-analysis";
  const secondQueueName = "core-platform.analytics.recommendation-analysis";
  const eventType = "recommendation-analysis.completed.v1";

  await new RabbitMqTopologyProvisioner().assertSubscription(channel, {
    queueName: firstQueueName,
    eventTypes: [eventType],
  });
  await new RabbitMqTopologyProvisioner().assertSubscription(channel, {
    queueName: secondQueueName,
    eventTypes: [eventType],
  });

  assert.deepEqual(queueArguments.get(firstQueueName), {
    "x-dead-letter-exchange": IntegrationTopology.exchanges.deadLetter.name,
    "x-dead-letter-routing-key":
      IntegrationTopology.deadLetterRoutingKey(firstQueueName),
  });
  assert.deepEqual(
    queueArguments.get(IntegrationTopology.retryQueueName(firstQueueName)),
    {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": firstQueueName,
    },
  );
  assert.deepEqual(
    queueArguments.get(IntegrationTopology.retryQueueName(secondQueueName)),
    {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": secondQueueName,
    },
  );
  assert.equal(
    bindings.some(
      ([queue]) =>
        queue === IntegrationTopology.retryQueueName(firstQueueName) ||
        queue === IntegrationTopology.retryQueueName(secondQueueName),
    ),
    false,
  );
  assert.ok(
    bindings.some(
      ([queue, exchange, routingKey]) =>
        queue === IntegrationTopology.deadLetterQueueName(firstQueueName) &&
        exchange === IntegrationTopology.exchanges.deadLetter.name &&
        routingKey === IntegrationTopology.deadLetterRoutingKey(firstQueueName),
    ),
  );
  assert.equal(
    bindings.some(([, , routingKey]) => routingKey === "#"),
    false,
  );
});
