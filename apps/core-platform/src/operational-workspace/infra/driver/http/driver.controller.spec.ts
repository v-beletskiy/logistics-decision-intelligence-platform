import * as assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { test } from "node:test";

import { Global, Module, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AccessControlModule } from "../../../../shared/access-control/access-control.module";
import { IdentityType } from "../../../../shared/access-control/identity/identity-type.enum";
import { AccessTokenIssuer } from "../../../../shared/access-control/jwt/access-token-issuer";
import { Role } from "../../../../shared/access-control/roles/role.enum";
import { DomainEventBus } from "../../../../shared/app/messaging/domain-event-bus";
import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../shared/infra/config/app-config";
import { HttpExceptionFilter } from "../../../../shared/infra/http/http-exception.filter";
import { TransactionManager } from "../../../../shared/infra/persistence/transaction-manager";
import { AddDriverCertificationHandler } from "../../../app/driver/commands/add-driver-certification/add-driver-certification.handler";
import { ChangeDriverAvailabilityHandler } from "../../../app/driver/commands/change-driver-availability/change-driver-availability.handler";
import { RegisterDriverHandler } from "../../../app/driver/commands/register-driver/register-driver.handler";
import { ReinstateDriverHandler } from "../../../app/driver/commands/reinstate-driver/reinstate-driver.handler";
import { RemoveDriverCertificationHandler } from "../../../app/driver/commands/remove-driver-certification/remove-driver-certification.handler";
import { SuspendDriverHandler } from "../../../app/driver/commands/suspend-driver/suspend-driver.handler";
import { UpdateDriverCertificationHandler } from "../../../app/driver/commands/update-driver-certification/update-driver-certification.handler";
import { UpdateDriverDetailsHandler } from "../../../app/driver/commands/update-driver-details/update-driver-details.handler";
import {
  DriverReadStore,
  type DriverSearchCriteria,
} from "../../../app/driver/queries/search-drivers/driver-read-store";
import type { DriverSearch } from "../../../app/driver/queries/search-drivers/driver-search";
import { SearchDriversHandler } from "../../../app/driver/queries/search-drivers/search-drivers.handler";
import type { Driver } from "../../../domain-modules/driver/domain/driver.aggregate";
import { DepotRepository } from "../../../domain-modules/depot/domain/depot.repository";
import type { DriverId } from "../../../domain-modules/driver/domain/driver-id";
import {
  DriverRepository,
  type LoadedDriver,
} from "../../../domain-modules/driver/domain/driver.repository";
import { DriverController } from "./driver.controller";

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const tenantId = "00000000-0000-4000-8000-000000000010";
const otherTenantId = "00000000-0000-4000-8000-000000000011";

const testConfig: AppConfig = {
  processRoles: ["api"],
  host: "127.0.0.1",
  port: 3000,
  schemaBaseUri: "https://schemas.example.com",
  database: { url: "postgres://unused", poolMax: 1 },
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
  optimization: {
    vroomUrl: "http://vroom:3000",
    osrmUrl: "http://osrm:5000",
    workerPrefetch: 1,
  },
};

@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useValue: testConfig }],
  exports: [APP_CONFIG],
})
class TestConfigModule {}

class InMemoryTransactionManager extends TransactionManager {
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

  findByIdForUpdate(tenant: string, id: DriverId): Promise<LoadedDriver | null> {
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
  async search(_criteria: DriverSearchCriteria, search: DriverSearch) {
    return search.mode === "page"
      ? {
          mode: "page" as const,
          items: [],
          page: search.page,
          pageSize: search.pageSize,
          totalItems: 0,
          totalPages: 0,
        }
      : {
          mode: "cursor" as const,
          items: [],
          pageSize: search.pageSize,
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
    { provide: TransactionManager, useClass: InMemoryTransactionManager },
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
    assert.match(unauthenticated.headers["content-type"] ?? "", /application\/problem\+json/);

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
    assert.equal(invalid.json().type, "urn:problem:logistics:request.validation");

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
