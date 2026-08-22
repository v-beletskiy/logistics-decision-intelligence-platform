import * as assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { test } from "node:test";

import { Global, Module, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AccessControlModule } from "../../../../../../shared/modules/access-control/access-control.module";
import { AccessTokenIssuer } from "../../../../../../shared/modules/access-control/app/authentication/access-token-issuer";
import { IdentityType } from "../../../../../../shared/modules/access-control/app/identity/identity-type.enum";
import { Role } from "../../../../../../shared/modules/access-control/domain/role";
import { DomainEventBus } from "../../../../../../shared/app/messaging/domain-event-bus";
import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../../../shared/infra/config/app-config";
import { HttpExceptionFilter } from "../../../../../../shared/infra/http/http-exception.filter";
import { TrxManager } from "../../../../../../shared/app/trx/trx-manager";
import { AddVehicleCompartmentHandler } from "../../app/commands/add-vehicle-compartment/add-vehicle-compartment.handler";
import { ChangeVehicleAvailabilityHandler } from "../../app/commands/change-vehicle-availability/change-vehicle-availability.handler";
import { DecommissionVehicleHandler } from "../../app/commands/decommission-vehicle/decommission-vehicle.handler";
import { RegisterVehicleHandler } from "../../app/commands/register-vehicle/register-vehicle.handler";
import { RemoveVehicleCompartmentHandler } from "../../app/commands/remove-vehicle-compartment/remove-vehicle-compartment.handler";
import { ReturnVehicleFromMaintenanceHandler } from "../../app/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.handler";
import { SendVehicleToMaintenanceHandler } from "../../app/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.handler";
import { UpdateVehicleCompartmentHandler } from "../../app/commands/update-vehicle-compartment/update-vehicle-compartment.handler";
import { UpdateVehicleDetailsHandler } from "../../app/commands/update-vehicle-details/update-vehicle-details.handler";
import { VehicleId } from "../../domain/vehicle-id";
import { Vehicle } from "../../domain/vehicle.aggregate";
import {
  VehicleRepository,
  type LoadedVehicle,
} from "../../domain/vehicle.repository";
import { VehicleController } from "./vehicle.controller";

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
    issuer: "vehicle-http-test",
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

class InMemoryVehicleRepository extends VehicleRepository {
  private readonly records = new Map<string, LoadedVehicle>();

  findById(tenant: string, id: VehicleId): Promise<LoadedVehicle | null> {
    return Promise.resolve(this.records.get(`${tenant}:${id.value}`) ?? null);
  }

  findAvailable(tenant: string): Promise<readonly Vehicle[]> {
    const vehicles: Vehicle[] = [];
    for (const [key, record] of this.records) {
      if (key.startsWith(`${tenant}:`)) vehicles.push(record.aggregate);
    }
    return Promise.resolve(vehicles);
  }

  add(tenant: string, vehicle: Vehicle): Promise<void> {
    this.records.set(`${tenant}:${vehicle.id.value}`, {
      aggregate: vehicle,
      expectedRevision: "1",
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedVehicle): Promise<string> {
    this.records.set(`${tenant}:${loaded.aggregate.id.value}`, {
      ...loaded,
      expectedRevision: "2",
    });
    return Promise.resolve("2");
  }
}

@Module({
  imports: [TestConfigModule, AccessControlModule],
  controllers: [VehicleController],
  providers: [
    HttpExceptionFilter,
    RegisterVehicleHandler,
    UpdateVehicleDetailsHandler,
    ChangeVehicleAvailabilityHandler,
    SendVehicleToMaintenanceHandler,
    ReturnVehicleFromMaintenanceHandler,
    DecommissionVehicleHandler,
    AddVehicleCompartmentHandler,
    UpdateVehicleCompartmentHandler,
    RemoveVehicleCompartmentHandler,
    { provide: VehicleRepository, useClass: InMemoryVehicleRepository },
    { provide: TrxManager, useClass: InMemoryTrxManager },
    { provide: DomainEventBus, useClass: DiscardingDomainEventBus },
  ],
})
class VehicleHttpTestModule {}

function registerPayload() {
  return {
    registrationNumber: "AA1234BC",
    name: "Truck 1",
    compartments: [
      {
        type: "DRY_CARGO",
        name: "Main",
        capacity: {
          maxWeight: { value: 2000, unit: "KILOGRAM" },
          maxItemDimensions: {
            length: 3,
            width: 3,
            height: 3,
            unit: "METER",
          },
          maxVolume: { value: 20, unit: "CUBIC_METER" },
        },
      },
    ],
  };
}

function compartmentPayload() {
  return {
    type: "REFRIGERATED",
    name: "Cold",
    capacity: {
      maxWeight: { value: 500, unit: "KILOGRAM" },
      maxItemDimensions: {
        length: 2,
        width: 2,
        height: 2,
        unit: "METER",
      },
      maxVolume: { value: 8, unit: "CUBIC_METER" },
    },
  };
}

test("Vehicle HTTP slice authenticates, validates, authorizes and executes every use case", async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    VehicleHttpTestModule,
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
        id: "00000000-0000-4000-8000-000000000002",
        tenantId,
        roles: [Role.Planner],
        type: IdentityType.User,
      })
    ).accessToken;
    const otherTenantToken = (
      await tokens.issue({
        id: "00000000-0000-4000-8000-000000000003",
        tenantId: otherTenantId,
        roles: [Role.Planner],
        type: IdentityType.User,
      })
    ).accessToken;
    const authorization = { authorization: `Bearer ${plannerToken}` };

    const unauthenticated = await app.inject({
      method: "POST",
      url: "/api/v1/vehicles",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.match(
      unauthenticated.headers["content-type"] ?? "",
      /application\/problem\+json/,
    );

    const unexpectedField = await app.inject({
      method: "POST",
      url: "/api/v1/vehicles",
      headers: authorization,
      payload: { ...registerPayload(), unexpected: true },
    });
    assert.equal(unexpectedField.statusCode, 400);
    assert.equal(
      unexpectedField.json().type,
      "urn:problem:logistics:request.validation",
    );

    const registered = await app.inject({
      method: "POST",
      url: "/api/v1/vehicles",
      headers: authorization,
      payload: registerPayload(),
    });
    assert.equal(registered.statusCode, 201);
    const vehicleId = registered.json().id as string;
    assert.ok(vehicleId.length > 0);

    const updated = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}`,
      headers: authorization,
      payload: { registrationNumber: "AA5678CD", name: "Truck 2" },
    });
    assert.equal(updated.statusCode, 204);

    const markedUnavailable = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/availability`,
      headers: authorization,
      payload: { available: false },
    });
    assert.equal(markedUnavailable.statusCode, 204);

    const markedAvailable = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/availability`,
      headers: authorization,
      payload: { available: true },
    });
    assert.equal(markedAvailable.statusCode, 204);

    const sentToMaintenance = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/maintenance`,
      headers: authorization,
    });
    assert.equal(sentToMaintenance.statusCode, 204);

    const returnedFromMaintenance = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/service`,
      headers: authorization,
    });
    assert.equal(returnedFromMaintenance.statusCode, 204);

    const compartmentAdded = await app.inject({
      method: "POST",
      url: `/api/v1/vehicles/${vehicleId}/compartments`,
      headers: authorization,
      payload: compartmentPayload(),
    });
    assert.equal(compartmentAdded.statusCode, 201);
    const compartmentId = compartmentAdded.json().id as string;
    assert.ok(compartmentId.length > 0);

    const compartmentUpdated = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/compartments/${compartmentId}`,
      headers: authorization,
      payload: compartmentPayload(),
    });
    assert.equal(compartmentUpdated.statusCode, 204);

    const compartmentRemoved = await app.inject({
      method: "DELETE",
      url: `/api/v1/vehicles/${vehicleId}/compartments/${compartmentId}`,
      headers: authorization,
    });
    assert.equal(compartmentRemoved.statusCode, 204);

    const unknownCompartment = await app.inject({
      method: "DELETE",
      url: `/api/v1/vehicles/${vehicleId}/compartments/${compartmentId}`,
      headers: authorization,
    });
    assert.equal(unknownCompartment.statusCode, 422);
    assert.equal(
      unknownCompartment.json().type,
      "urn:problem:logistics:operational-workspace.vehicle.vehicle-must-have-at-least-one-compartment",
    );

    const tenantIsolated = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/decommissioning`,
      headers: { authorization: `Bearer ${otherTenantToken}` },
    });
    assert.equal(tenantIsolated.statusCode, 404);

    const decommissioned = await app.inject({
      method: "PUT",
      url: `/api/v1/vehicles/${vehicleId}/decommissioning`,
      headers: authorization,
    });
    assert.equal(decommissioned.statusCode, 204);
  } finally {
    await app.close();
  }
});
