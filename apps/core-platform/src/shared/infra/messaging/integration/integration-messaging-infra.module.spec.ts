import * as assert from "node:assert/strict";
import { test } from "node:test";

import { InboxProcessor } from "./inbound/inbox/inbox-processor.js";
import { RabbitMqIntegrationEventConsumer } from "./inbound/rabbitmq-integration-event-consumer.js";
import { IntegrationMessagingInfraModule } from "./integration-messaging-infra.module.js";
import { RabbitMqOutboxPublisher } from "./outbound/outbox/rabbitmq-outbox-publisher.js";

test("API messaging registers outbox writes without broker workers", () => {
  const module = IntegrationMessagingInfraModule.register("api");

  assert.equal(module.providers?.includes(InboxProcessor), false);
  assert.equal(
    module.providers?.includes(RabbitMqIntegrationEventConsumer),
    false,
  );
  assert.equal(module.providers?.includes(RabbitMqOutboxPublisher), false);
});

test("worker messaging registers consumers and the outbox drainer", () => {
  const module = IntegrationMessagingInfraModule.register("worker");

  assert.equal(module.providers?.includes(InboxProcessor), true);
  assert.equal(
    module.providers?.includes(RabbitMqIntegrationEventConsumer),
    true,
  );
  assert.equal(module.providers?.includes(RabbitMqOutboxPublisher), true);
});
