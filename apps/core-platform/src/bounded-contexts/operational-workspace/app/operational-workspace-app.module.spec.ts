import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Global, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AccessManager } from "../../../shared/modules/access-control/app/authorization/access-manager";
import {
  APP_CONFIG,
  type ApiAppConfig,
} from "../../../shared/infra/config/app-config";
import { DomainEventBus } from "../../../shared/app/messaging/domain-event-bus";
import { InternalApplicationEventBus } from "../../../shared/app/messaging/internal-application-event-bus";
import { PgDatabase } from "../../../shared/infra/persistence/pg-database";
import { PgTrxManager } from "../../../shared/infra/persistence/pg-trx-manager";
import { TrxManager } from "../../../shared/app/trx/trx-manager";
import { OperationalWorkspaceAppModule } from "./operational-workspace-app.module";

const testConfig: ApiAppConfig = {
  processRole: "api",
  schemaBaseUri: "https://schemas.example.com",
  database: {
    url: "postgres://test:test@127.0.0.1:5432/test",
    maxConnections: 1,
  },
  messaging: {
    rabbitMqUrl: "amqp://test:test@127.0.0.1:5672/test",
    reconnectDelayMs: 1_000,
    retryBaseDelayMs: 1_000,
    maxDeliveryAttempts: 1,
    maxIncomingMessageBytes: 1_024,
    maxOutgoingMessageBytes: 1_024,
    outboxPollIntervalMs: 1_000,
    outboxBatchSize: 1,
    outboxMaxBatchesPerDrain: 1,
    outboxProcessingLeaseMs: 1_000,
  },
  http: { host: "127.0.0.1", port: 3_000 },
  grpc: { host: "127.0.0.1", port: 50_051 },
  authentication: {
    issuer: "test",
    audience: "test",
    accessTokenTtlSeconds: 60,
    privateKeyPem: "test",
    publicKeyPem: "test",
  },
};

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useValue: testConfig,
    },
    PgDatabase,
    {
      provide: TrxManager,
      useClass: PgTrxManager,
    },
    {
      provide: DomainEventBus,
      useValue: { publish: async () => undefined },
    },
    {
      provide: InternalApplicationEventBus,
      useValue: { publish: async () => undefined },
    },
    {
      provide: AccessManager,
      useValue: { authorize: async () => undefined },
    },
  ],
  exports: [
    APP_CONFIG,
    PgDatabase,
    TrxManager,
    DomainEventBus,
    InternalApplicationEventBus,
    AccessManager,
  ],
})
class OperationalWorkspaceDiInfrastructureModule {}

@Module({
  imports: [
    OperationalWorkspaceDiInfrastructureModule,
    OperationalWorkspaceAppModule,
  ],
})
class OperationalWorkspaceDiTestModule {}

test("resolves every operational-workspace application handler", async () => {
  const app = await NestFactory.createApplicationContext(
    OperationalWorkspaceDiTestModule,
    { logger: false, abortOnError: false },
  );

  try {
    assert.ok(app);
  } finally {
    await app.close();
  }
});
