import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Global, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { APP_CONFIG, type AppConfig } from "../../shared/infra/config/app-config";
import { DomainEventBus } from "../../shared/app/messaging/domain-event-bus";
import { InternalApplicationEventBus } from "../../shared/app/messaging/internal-application-event-bus";
import { PgDatabase } from "../../shared/infra/persistence/pg-database";
import { PgTransactionManager } from "../../shared/infra/persistence/pg-transaction-manager";
import { TransactionManager } from "../../shared/infra/persistence/transaction-manager";
import { OperationalWorkspaceAppModule } from "./operational-workspace-app.module";

const testConfig: AppConfig = {
  processRoles: ["worker"],
  host: "127.0.0.1",
  port: 3000,
  schemaBaseUri: "https://schemas.example.com",
  database: {
    url: "postgres://test:test@127.0.0.1:5432/test",
    poolMax: 1,
  },
  grpc: {
    host: "127.0.0.1",
    port: 50051,
  },
  authentication: {
    issuer: "test",
    audience: "test",
    accessTokenTtlSeconds: 900,
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
  optimization: {
    vroomUrl: "http://vroom:3000",
    osrmUrl: "http://osrm:5000",
    workerPrefetch: 1,
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
      provide: TransactionManager,
      useClass: PgTransactionManager,
    },
    {
      provide: DomainEventBus,
      useValue: { publish: async () => undefined },
    },
    {
      provide: InternalApplicationEventBus,
      useValue: { publish: async () => undefined },
    },
  ],
  exports: [
    APP_CONFIG,
    PgDatabase,
    TransactionManager,
    DomainEventBus,
    InternalApplicationEventBus,
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
