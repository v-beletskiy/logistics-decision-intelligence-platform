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
import { CancelShipmentHandler } from "../../../app/shipment/commands/cancel-shipment/cancel-shipment.handler";
import { CompleteDeliveryHandler } from "../../../app/shipment/commands/complete-delivery/complete-delivery.handler";
import { CompletePickupHandler } from "../../../app/shipment/commands/complete-pickup/complete-pickup.handler";
import { CreateShipmentHandler } from "../../../app/shipment/commands/create-shipment/create-shipment.handler";
import { UpdateShipmentDetailsHandler } from "../../../app/shipment/commands/update-shipment-details/update-shipment-details.handler";
import { Shipment } from "../../../domain-modules/shipment/domain/shipment.aggregate";
import type { ShipmentId } from "../../../domain-modules/shipment/domain/shipment-id";
import {
  ShipmentRepository,
  type LoadedShipment,
} from "../../../domain-modules/shipment/domain/shipment.repository";
import { ShipmentController } from "./shipment.controller";

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
    issuer: "shipment-http-test",
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

class InMemoryShipmentRepository extends ShipmentRepository {
  private readonly records = new Map<
    string,
    { readonly aggregate: Shipment; revision: number }
  >();

  findById(tenant: string, id: ShipmentId): Promise<LoadedShipment | null> {
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

  findByIds(
    tenant: string,
    ids: readonly ShipmentId[],
  ): Promise<readonly Shipment[]> {
    const shipments: Shipment[] = [];
    for (const id of ids) {
      const record = this.records.get(`${tenant}:${id.value}`);
      if (record !== undefined) shipments.push(record.aggregate);
    }
    return Promise.resolve(shipments);
  }

  add(tenant: string, shipment: Shipment): Promise<void> {
    this.records.set(`${tenant}:${shipment.id.value}`, {
      aggregate: shipment,
      revision: 1,
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedShipment): Promise<string> {
    const key = `${tenant}:${loaded.aggregate.id.value}`;
    const record = this.records.get(key);
    if (record === undefined) throw new Error("Shipment was not loaded.");
    record.revision += 1;
    return Promise.resolve(String(record.revision));
  }
}

@Module({
  imports: [TestConfigModule, AccessControlModule],
  controllers: [ShipmentController],
  providers: [
    HttpExceptionFilter,
    CreateShipmentHandler,
    UpdateShipmentDetailsHandler,
    CompletePickupHandler,
    CompleteDeliveryHandler,
    CancelShipmentHandler,
    { provide: ShipmentRepository, useClass: InMemoryShipmentRepository },
    { provide: TransactionManager, useClass: InMemoryTransactionManager },
    { provide: DomainEventBus, useClass: DiscardingDomainEventBus },
  ],
})
class ShipmentHttpTestModule {}

function createShipmentDetails() {
  return {
    pickup: {
      address: {
        country: "UA",
        city: "Kyiv",
        street: "Halytska",
        buildingNumber: "12",
        postalCode: "02000",
      },
      location: { latitude: 50.4501, longitude: 30.5234 },
      timeWindow: {
        start: "2026-08-10T08:00:00.000Z",
        end: "2026-08-10T10:00:00.000Z",
      },
    },
    delivery: {
      address: {
        country: "UA",
        city: "Lviv",
        street: "Horodotska",
        buildingNumber: "8",
        postalCode: "79000",
      },
      location: { latitude: 49.8397, longitude: 24.0297 },
      timeWindow: {
        start: "2026-08-10T14:00:00.000Z",
        end: "2026-08-10T16:00:00.000Z",
      },
    },
    weight: { value: 400, unit: "KILOGRAM" },
    dimensions: {
      length: 200,
      width: 120,
      height: 150,
      unit: "CENTIMETER",
    },
  };
}

test("Shipment HTTP slice authenticates, validates, authorizes and executes every use case", async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    ShipmentHttpTestModule,
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
      url: "/api/v1/shipments",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.match(
      unauthenticated.headers["content-type"] ?? "",
      /application\/problem\+json/,
    );

    const unexpectedField = await app.inject({
      method: "POST",
      url: "/api/v1/shipments",
      headers: authorization,
      payload: { ...createShipmentDetails(), unexpected: true },
    });
    assert.equal(unexpectedField.statusCode, 400);
    assert.equal(
      unexpectedField.json().type,
      "urn:problem:logistics:request.validation",
    );

    const invalidWeight = await app.inject({
      method: "POST",
      url: "/api/v1/shipments",
      headers: authorization,
      payload: {
        ...createShipmentDetails(),
        weight: { value: -1, unit: "KILOGRAM" },
      },
    });
    assert.equal(invalidWeight.statusCode, 400);

    const invalidTimeWindow = await app.inject({
      method: "POST",
      url: "/api/v1/shipments",
      headers: authorization,
      payload: {
        ...createShipmentDetails(),
        pickup: {
          ...createShipmentDetails().pickup,
          timeWindow: { start: "not-a-date", end: "2026-08-10T10:00:00.000Z" },
        },
      },
    });
    assert.equal(invalidTimeWindow.statusCode, 400);

    const created = await app.inject({
      method: "POST",
      url: "/api/v1/shipments",
      headers: authorization,
      payload: createShipmentDetails(),
    });
    assert.equal(created.statusCode, 201);
    const shipmentId = created.json().id as string;
    assert.ok(shipmentId.length > 0);

    const updated = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${shipmentId}`,
      headers: authorization,
      payload: {
        ...createShipmentDetails(),
        weight: { value: 500, unit: "KILOGRAM" },
      },
    });
    assert.equal(updated.statusCode, 204);
    assert.equal(updated.body, "");

    const pickupCompleted = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${shipmentId}/pickup`,
      headers: authorization,
    });
    assert.equal(pickupCompleted.statusCode, 204);

    const duplicateCompletePickup = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${shipmentId}/pickup`,
      headers: authorization,
    });
    assert.equal(duplicateCompletePickup.statusCode, 409);
    assert.equal(
      duplicateCompletePickup.json().type,
      "urn:problem:logistics:shipment.pickup-already-completed",
    );

    const deliveryCompleted = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${shipmentId}/delivery`,
      headers: authorization,
    });
    assert.equal(deliveryCompleted.statusCode, 204);

    const completedCancellation = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${shipmentId}/cancellation`,
      headers: authorization,
    });
    assert.equal(completedCancellation.statusCode, 409);
    assert.equal(
      completedCancellation.json().type,
      "urn:problem:logistics:shipment.cancellation-of-completed",
    );

    const secondCreated = await app.inject({
      method: "POST",
      url: "/api/v1/shipments",
      headers: authorization,
      payload: createShipmentDetails(),
    });
    assert.equal(secondCreated.statusCode, 201);
    const secondShipmentId = secondCreated.json().id as string;

    const deliveryBeforePickup = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${secondShipmentId}/delivery`,
      headers: authorization,
    });
    assert.equal(deliveryBeforePickup.statusCode, 409);
    assert.equal(
      deliveryBeforePickup.json().type,
      "urn:problem:logistics:shipment.delivery-requires-pickup",
    );

    const cancelled = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${secondShipmentId}/cancellation`,
      headers: authorization,
    });
    assert.equal(cancelled.statusCode, 204);

    const duplicateCancellation = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${secondShipmentId}/cancellation`,
      headers: authorization,
    });
    assert.equal(duplicateCancellation.statusCode, 409);
    assert.equal(
      duplicateCancellation.json().type,
      "urn:problem:logistics:shipment.already-cancelled",
    );

    const updateAfterCancellation = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${secondShipmentId}`,
      headers: authorization,
      payload: createShipmentDetails(),
    });
    assert.equal(updateAfterCancellation.statusCode, 409);
    assert.equal(
      updateAfterCancellation.json().type,
      "urn:problem:logistics:shipment.modification-not-allowed",
    );

    const tenantIsolated = await app.inject({
      method: "PUT",
      url: `/api/v1/shipments/${shipmentId}/pickup`,
      headers: { authorization: `Bearer ${otherTenantToken}` },
    });
    assert.equal(tenantIsolated.statusCode, 404);
  } finally {
    await app.close();
  }
});