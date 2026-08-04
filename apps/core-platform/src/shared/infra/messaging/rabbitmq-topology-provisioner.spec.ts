import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { Channel } from "amqplib";

import { IntegrationTopology } from "./integration-topology";
import { RabbitMqTopologyProvisioner } from "./rabbitmq-topology-provisioner";

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
    [IntegrationTopology.exchanges.retry.name, "topic", true],
    [IntegrationTopology.exchanges.deadLetter.name, "topic", true],
  ]);
});

// subscription’s dead-letter queue receives only its own failed messages
test("isolates each subscription's dead-letter queue by routing key", async () => {
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
  const queueName =
    "core-platform.decision-intelligence.recommendation-analysis";
  const eventType = "decision-intelligence.recommendation.analysis-completed";

  await new RabbitMqTopologyProvisioner().assertSubscription(channel, {
    queueName,
    eventTypes: [eventType],
  });

  assert.deepEqual(queueArguments.get(queueName), {
    "x-dead-letter-exchange": IntegrationTopology.exchanges.deadLetter.name,
    "x-dead-letter-routing-key":
      IntegrationTopology.deadLetterRoutingKey(queueName),
  });
  assert.ok(
    bindings.some(
      ([queue, exchange, routingKey]) =>
        queue === IntegrationTopology.deadLetterQueueName(queueName) &&
        exchange === IntegrationTopology.exchanges.deadLetter.name &&
        routingKey === IntegrationTopology.deadLetterRoutingKey(queueName),
    ),
  );
  assert.equal(
    bindings.some(([, , routingKey]) => routingKey === "#"),
    false,
  );
});
