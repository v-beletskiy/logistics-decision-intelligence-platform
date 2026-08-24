import * as assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { test } from "node:test";

import { Global, Module, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AccessControlModule } from "../../../../../../shared/modules/access-control/access-control.module.js";
import { IdentityType } from "../../../../../../shared/modules/access-control/app/identity/identity-type.enum.js";
import { AccessTokenIssuer } from "../../../../../../shared/modules/access-control/app/authentication/access-token-issuer.js";
import { Role } from "../../../../../../shared/modules/access-control/domain/role.js";
import { DomainEventBus } from "../../../../../../shared/app/messaging/domain-event-bus.js";
import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../../../shared/infra/config/app-config.js";
import { HttpExceptionFilter } from "../../../../../../shared/infra/http/http-exception.filter.js";
import { TrxManager } from "../../../../../../shared/app/trx/trx-manager.js";
import { AddDriverCertificationHandler } from "../../app/commands/add-driver-certification/add-driver-certification.handler.js";
import { ChangeDriverAvailabilityHandler } from "../../app/commands/change-driver-availability/change-driver-availability.handler.js";
import { RegisterDriverHandler } from "../../app/commands/register-driver/register-driver.handler.js";
import { ReinstateDriverHandler } from "../../app/commands/reinstate-driver/reinstate-driver.handler.js";
import { RemoveDriverCertificationHandler } from "../../app/commands/remove-driver-certification/remove-driver-certification.handler.js";
import { SuspendDriverHandler } from "../../app/commands/suspend-driver/suspend-driver.handler.js";
import { UpdateDriverCertificationHandler } from "../../app/commands/update-driver-certification/update-driver-certification.handler.js";
import { UpdateDriverDetailsHandler } from "../../app/commands/update-driver-details/update-driver-details.handler.js";
import {
  DriverReadStore,
  type DriverSearchCriteria,
} from "../../app/ports/driver-read-store.js";
import type { DriverSearchOptions } from "../../app/queries/search-drivers/driver-search-options.js";
import { SearchDriversHandler } from "../../app/queries/search-drivers/search-drivers.handler.js";
import type { Driver } from "../../domain/driver.aggregate.js";
import { DepotRepository } from "../../../depot/domain/depot.repository.js";
import type { DriverId } from "../../domain/driver-id.js";
import {
  DriverRepository,
  type LoadedDriver,
} from "../../domain/driver.repository.js";
import { DriverController } from "./driver.controller.js";

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const tenantId = "00000000-0000-4000-8000-000000000010";
const otherTenantId = "00000000-0000-4000-8000-000000000011";

const testConfig: AppConfig = {
  processRole: "api",
  http: { host: "127.0.0.1", port: 3000 },
  schemaBaseUri: "https://schemas.example.com",
  database: { url: "postgres://unused", maxConnections: 1 },
  grpc: { host: "127.0.0.1", port: 50051 },
  authentication: {
    issuer: "driver-http-test",
    audience: "core-platform",
    accessTokenTtlSeconds: 900,
    privateKeyPem: privateKey,
    publicKeyPem: publicKey,
  },
  messaging: {
    rabbitMqUrl: "amqp://unused",
    reconnectDelayMs: 1,
    retryBaseDelayMs: 1,
    maxDeliveryAttempts: 1,
    maxIncomingMessageBytes: 1024,
    maxOutgoingMessageBytes: 1024,
    outboxPollIntervalMs: 1,
    outboxBatchSize: 1,
    outboxMaxBatchesPerDrain: 1,
    outboxProcessingLeaseMs: 1,
  },
};

@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useValue: testConfig }],
  exports: [APP_CONFIG],
})
class TestConfigModule {}

class InMemoryTrxManager extends TrxManager {
  run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}

class DiscardingDomainEventBus extends DomainEventBus {
  async publish(): Promise<void> {}
}

class InMemoryDriverRepository extends DriverRepository {
  private readonly records = new Map<
    string,
    { readonly aggregate: Driver; revision: number }
  >();

  findById(tenant: string, id: DriverId): Promise<LoadedDriver | null> {
    const record = this.records.get(`${tenant}:${id.value}`);
    return Promise.resolve(
      record === undefined
        ? null
        : {
            aggregate: record.aggregate,
            expectedRevision: String(record.revision),
          },
    );
  }

  findByIdForUpdate(
    tenant: string,
    id: DriverId,
  ): Promise<LoadedDriver | null> {
    return this.findById(tenant, id);
  }

  add(tenant: string, driver: Driver): Promise<void> {
    this.records.set(`${tenant}:${driver.id.value}`, {
      aggregate: driver,
      revision: 1,
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedDriver): Promise<string> {
    const key = `${tenant}:${loaded.aggregate.id.value}`;
    const record = this.records.get(key);
    if (record === undefined) throw new Error("Driver was not loaded.");
    record.revision += 1;
    return Promise.resolve(String(record.revision));
  }
}

class EmptyDriverReadStore extends DriverReadStore {
  async search(_criteria: DriverSearchCriteria, options: DriverSearchOptions) {
    return options.mode === "page"
      ? {
          mode: "page" as const,
          items: [],
          page: options.page,
          pageSize: options.pageSize,
          totalItems: 0,
          totalPages: 0,
        }
      : {
          mode: "cursor" as const,
          items: [],
          pageSize: options.pageSize,
        };
  }
}

@Module({
  imports: [TestConfigModule, AccessControlModule],
  controllers: [DriverController],
  providers: [
    HttpExceptionFilter,
    RegisterDriverHandler,
    UpdateDriverDetailsHandler,
    ChangeDriverAvailabilityHandler,
    SuspendDriverHandler,
    ReinstateDriverHandler,
    AddDriverCertificationHandler,
    UpdateDriverCertificationHandler,
    RemoveDriverCertificationHandler,
    SearchDriversHandler,
    { provide: DriverRepository, useClass: InMemoryDriverRepository },
    {
      provide: DepotRepository,
      useValue: {
        findById: async () => null,
        find: async () => [],
        add: async () => undefined,
        save: async () => "1",
      },
    },
    { provide: DriverReadStore, useClass: EmptyDriverReadStore },
    { provide: TrxManager, useClass: InMemoryTrxManager },
    { provide: DomainEventBus, useClass: DiscardingDomainEventBus },
  ],
})
class DriverHttpTestModule {}

test("Driver HTTP slice authenticates, validates, authorizes and executes every use case", async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    DriverHttpTestModule,
    new FastifyAdapter(),
    { logger: false },
  );
  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  try {
    const tokens = app.get(AccessTokenIssuer);
    const plannerToken = (
      await tokens.issue({
        id: "00000000-0000-4000-8000-000000000001",
        tenantId,
        roles: [Role.Planner],
        type: IdentityType.User,
      })
    ).accessToken;
    const otherTenantToken = (
      await tokens.issue({
        id: "00000000-0000-4000-8000-000000000002",
        tenantId: otherTenantId,
        roles: [Role.Planner],
        type: IdentityType.User,
      })
    ).accessToken;
    const authorization = { authorization: `Bearer ${plannerToken}` };

    const unauthenticated = await app.inject({
      method: "GET",
      url: "/api/v1/drivers",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.match(
      unauthenticated.headers["content-type"] ?? "",
      /application\/problem\+json/,
    );

    const invalid = await app.inject({
      method: "POST",
      url: "/api/v1/drivers",
      headers: authorization,
      payload: {
        firstName: "Ada",
        lastName: "Grey",
        licenseNumber: "DL-1",
        unexpected: true,
      },
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(
      invalid.json().type,
      "urn:problem:logistics:request.validation",
    );

    const invalidEmptyName = await app.inject({
      method: "POST",
      url: "/api/v1/drivers",
      headers: authorization,
      payload: {
        firstName: "",
        lastName: "Grey",
        licenseNumber: "DL-1",
      },
    });
    assert.equal(invalidEmptyName.statusCode, 400);

    const invalidSearchCombination = await app.inject({
      method: "GET",
      url: "/api/v1/drivers?mode=cursor&page=1",
      headers: authorization,
    });
    assert.equal(invalidSearchCombination.statusCode, 400);

    const oversizedCursor = await app.inject({
      method: "GET",
      url: `/api/v1/drivers?mode=cursor&cursor=${"x".repeat(2049)}`,
      headers: authorization,
    });
    assert.equal(oversizedCursor.statusCode, 400);

    const defaultSearch = await app.inject({
      method: "GET",
      url: "/api/v1/drivers?page=1&pageSize=10",
      headers: authorization,
    });
    assert.equal(defaultSearch.statusCode, 200);
    assert.equal(defaultSearch.json().mode, "page");

    const registered = await app.inject({
      method: "POST",
      url: "/api/v1/drivers",
      headers: authorization,
      payload: {
        firstName: "Ada",
        lastName: "Grey",
        licenseNumber: "DL-1",
      },
    });
    assert.equal(registered.statusCode, 201);
    const driverId = registered.json().id as string;

    const searched = await app.inject({
      method: "GET",
      url: "/api/v1/drivers?mode=page&page=1&pageSize=10&sortBy=name&direction=desc",
      headers: authorization,
    });
    assert.equal(searched.statusCode, 200);
    assert.equal(searched.json().mode, "page");

    const updated = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}`,
      headers: authorization,
      payload: {
        firstName: "Ada",
        lastName: "Byron",
        licenseNumber: "DL-1",
        phoneNumber: "+380000000000",
      },
    });
    assert.equal(updated.statusCode, 204);

    const addedCertification = await app.inject({
      method: "POST",
      url: `/api/v1/drivers/${driverId}/certifications`,
      headers: authorization,
      payload: certification("HAZMAT-1"),
    });
    assert.equal(addedCertification.statusCode, 201);
    const certificationId = addedCertification.json().id as string;

    const updatedCertification = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}/certifications/${certificationId}`,
      headers: authorization,
      payload: certification("HAZMAT-2"),
    });
    assert.equal(updatedCertification.statusCode, 204);

    const removedCertification = await app.inject({
      method: "DELETE",
      url: `/api/v1/drivers/${driverId}/certifications/${certificationId}`,
      headers: authorization,
    });
    assert.equal(removedCertification.statusCode, 204);

    const unavailable = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}/availability`,
      headers: authorization,
      payload: { available: false },
    });
    assert.equal(unavailable.statusCode, 204);

    const suspended = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}/suspension`,
      headers: authorization,
    });
    assert.equal(suspended.statusCode, 204);

    const duplicateSuspension = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}/suspension`,
      headers: authorization,
    });
    assert.equal(duplicateSuspension.statusCode, 409);
    assert.equal(
      duplicateSuspension.json().type,
      "urn:problem:logistics:driver.already-suspended",
    );

    const reinstated = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}/reinstatement`,
      headers: authorization,
    });
    assert.equal(reinstated.statusCode, 204);

    const tenantIsolated = await app.inject({
      method: "PUT",
      url: `/api/v1/drivers/${driverId}/availability`,
      headers: { authorization: `Bearer ${otherTenantToken}` },
      payload: { available: true },
    });
    assert.equal(tenantIsolated.statusCode, 404);
  } finally {
    await app.close();
  }
});

function certification(credentialNumber: string) {
  return {
    type: "HAZMAT",
    credentialNumber,
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: "2027-01-01T00:00:00.000Z",
  };
}
