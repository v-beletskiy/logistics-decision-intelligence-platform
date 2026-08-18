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
import { AccessTokenIssuer } from "../../../../shared/access-control/jwt/access-token-issuer";
import { IdentityType } from "../../../../shared/access-control/identity/identity-type.enum";
import { Role } from "../../../../shared/access-control/roles/role.enum";
import { DomainEventBus } from "../../../../shared/app/messaging/domain-event-bus";
import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../shared/infra/config/app-config";
import { HttpExceptionFilter } from "../../../../shared/infra/http/http-exception.filter";
import { TransactionManager } from "../../../../shared/infra/persistence/transaction-manager";
import { ActivateDepotHandler } from "../../../app/depot/commands/activate-depot/activate-depot.handler";
import { CloseDepotHandler } from "../../../app/depot/commands/close-depot/close-depot.handler";
import { CreateDepotHandler } from "../../../app/depot/commands/create-depot/create-depot.handler";
import { InactivateDepotHandler } from "../../../app/depot/commands/inactivate-depot/inactivate-depot.handler";
import { UpdateDepotDetailsHandler } from "../../../app/depot/commands/update-depot-details/update-depot-details.handler";
import { UpdateDepotDriverCapacityHandler } from "../../../app/depot/commands/update-depot-driver-capacity/update-depot-driver-capacity.handler";
import { UpdateDepotVehicleCapacityHandler } from "../../../app/depot/commands/update-depot-vehicle-capacity/update-depot-vehicle-capacity.handler";
import { Depot } from "../../../domain-modules/depot/domain/depot.aggregate";
import { DepotId } from "../../../domain-modules/depot/domain/depot-id";
import {
  DepotRepository,
  type LoadedDepot,
} from "../../../domain-modules/depot/domain/depot.repository";
import { DepotController } from "./depot.controller";

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
    issuer: "depot-http-test",
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

class InMemoryTransactionManager extends TransactionManager {
  run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}

class DiscardingDomainEventBus extends DomainEventBus {
  async publish(): Promise<void> {}
}

class InMemoryDepotRepository extends DepotRepository {
  private readonly records = new Map<
    string,
    { readonly aggregate: Depot; revision: number }
  >();

  findById(tenant: string, id: DepotId): Promise<LoadedDepot | null> {
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

  find(tenant: string): Promise<readonly Depot[]> {
    const records: Depot[] = [];
    for (const [key, record] of this.records) {
      if (key.startsWith(`${tenant}:`)) records.push(record.aggregate);
    }
    return Promise.resolve(records);
  }

  add(tenant: string, depot: Depot): Promise<void> {
    this.records.set(`${tenant}:${depot.id.value}`, {
      aggregate: depot,
      revision: 1,
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedDepot): Promise<string> {
    const key = `${tenant}:${loaded.aggregate.id.value}`;
    const record = this.records.get(key);
    if (record === undefined) throw new Error("Depot was not loaded.");
    record.revision += 1;
    return Promise.resolve(String(record.revision));
  }
}

@Module({
  imports: [TestConfigModule, AccessControlModule],
  controllers: [DepotController],
  providers: [
    HttpExceptionFilter,
    CreateDepotHandler,
    UpdateDepotDetailsHandler,
    UpdateDepotVehicleCapacityHandler,
    UpdateDepotDriverCapacityHandler,
    ActivateDepotHandler,
    InactivateDepotHandler,
    CloseDepotHandler,
    { provide: DepotRepository, useClass: InMemoryDepotRepository },
    { provide: TransactionManager, useClass: InMemoryTransactionManager },
    { provide: DomainEventBus, useClass: DiscardingDomainEventBus },
  ],
})
class DepotHttpTestModule {}

function createDepotRequest() {
  return {
    details: {
      name: "East Depot",
      address: {
        country: "UA",
        city: "Kyiv",
        street: "Halytska",
        buildingNumber: "12",
        postalCode: "02000",
      },
      location: { latitude: 50.4501, longitude: 30.5234 },
    },
    vehicleCapacity: 20,
    driverCapacity: 10,
  };
}

test("Depot HTTP slice authenticates, validates, authorizes and executes every use case", async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    DepotHttpTestModule,
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
      method: "POST",
      url: "/api/v1/depots",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.match(
      unauthenticated.headers["content-type"] ?? "",
      /application\/problem\+json/,
    );

    const unexpectedField = await app.inject({
      method: "POST",
      url: "/api/v1/depots",
      headers: authorization,
      payload: { ...createDepotRequest(), unexpected: true },
    });
    assert.equal(unexpectedField.statusCode, 400);
    assert.equal(
      unexpectedField.json().type,
      "urn:problem:logistics:request.validation",
    );

    const invalidCapacity = await app.inject({
      method: "POST",
      url: "/api/v1/depots",
      headers: authorization,
      payload: {
        ...createDepotRequest(),
        vehicleCapacity: 0,
      },
    });
    assert.equal(invalidCapacity.statusCode, 400);

    const created = await app.inject({
      method: "POST",
      url: "/api/v1/depots",
      headers: authorization,
      payload: createDepotRequest(),
    });
    assert.equal(created.statusCode, 201);
    const depotId = created.json().id as string;
    assert.ok(depotId.length > 0);

    const updatedDetails = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}`,
      headers: authorization,
      payload: { details: { ...createDepotRequest().details, name: "West Depot" } },
    });
    assert.equal(updatedDetails.statusCode, 204);
    assert.equal(updatedDetails.body, "");

    const updatedVehicleCapacity = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/vehicle-capacity`,
      headers: authorization,
      payload: { vehicleCapacity: 30 },
    });
    assert.equal(updatedVehicleCapacity.statusCode, 204);

    const updatedDriverCapacity = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/driver-capacity`,
      headers: authorization,
      payload: { driverCapacity: 15 },
    });
    assert.equal(updatedDriverCapacity.statusCode, 204);

    const inactivated = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/inactivation`,
      headers: authorization,
    });
    assert.equal(inactivated.statusCode, 204);

    const activated = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/activation`,
      headers: authorization,
    });
    assert.equal(activated.statusCode, 204);

    const duplicateActivation = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/activation`,
      headers: authorization,
    });
    assert.equal(duplicateActivation.statusCode, 422);
    assert.equal(
      duplicateActivation.json().type,
      "urn:problem:logistics:domain.rule-violation",
    );

    const closed = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/closure`,
      headers: authorization,
    });
    assert.equal(closed.statusCode, 204);

    const updateAfterClosure = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}`,
      headers: authorization,
      payload: { details: createDepotRequest().details },
    });
    assert.equal(updateAfterClosure.statusCode, 422);
    assert.equal(
      updateAfterClosure.json().type,
      "urn:problem:logistics:domain.rule-violation",
    );

    const tenantIsolated = await app.inject({
      method: "PUT",
      url: `/api/v1/depots/${depotId}/inactivation`,
      headers: { authorization: `Bearer ${otherTenantToken}` },
    });
    assert.equal(tenantIsolated.statusCode, 404);
  } finally {
    await app.close();
  }
});