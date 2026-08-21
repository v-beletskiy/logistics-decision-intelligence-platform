import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RabbitMqOutboxPublisher } from "./messaging/integration/outbound/outbox/rabbitmq-outbox-publisher";
import { InfraModule } from "./infra.module";
import { HealthController } from "./http/health.controller";
import { HttpExceptionFilter } from "./http/http-exception.filter";

test("registers only API infrastructure for the api role", () => {
  const apiModule = InfraModule.register(["api"]);

  assert.deepEqual(apiModule.controllers, [HealthController]);
  assert.equal(apiModule.providers?.includes(HttpExceptionFilter), true);
  assert.equal(apiModule.providers?.includes(RabbitMqOutboxPublisher), false);
});

test("registers only background infrastructure for the worker role", () => {
  const workerModule = InfraModule.register(["worker"]);

  assert.deepEqual(workerModule.controllers, []);
  assert.equal(workerModule.providers?.includes(HttpExceptionFilter), false);
  assert.equal(workerModule.providers?.includes(RabbitMqOutboxPublisher), true);
});
