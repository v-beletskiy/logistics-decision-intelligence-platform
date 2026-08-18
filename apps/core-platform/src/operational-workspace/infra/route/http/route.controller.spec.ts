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
import { InternalApplicationEventBus } from "../../../../shared/app/messaging/internal-application-event-bus";
import {
  APP_CONFIG,
  type AppConfig,
} from "../../../../shared/infra/config/app-config";
import { HttpExceptionFilter } from "../../../../shared/infra/http/http-exception.filter";
import { TransactionManager } from "../../../../shared/infra/persistence/transaction-manager";
import {
  DimensionUnit,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import { CancelRouteHandler } from "../../../app/route/commands/cancel-route/cancel-route.handler";
import { CompleteRouteHandler } from "../../../app/route/commands/complete-route/complete-route.handler";
import { CreateRouteHandler } from "../../../app/route/commands/create-route/create-route.handler";
import { RecordRouteStopArrivalHandler } from "../../../app/route/commands/record-route-stop-arrival/record-route-stop-arrival.handler";
import { RecordRouteStopDepartureHandler } from "../../../app/route/commands/record-route-stop-departure/record-route-stop-departure.handler";
import { StartRouteHandler } from "../../../app/route/commands/start-route/start-route.handler";
import { StartRouteStopHandler } from "../../../app/route/commands/start-route-stop/start-route-stop.handler";
import { AssignmentRepository } from "../../../domain-modules/assignment/domain/assignment.repository";
import { RoutePlanningPolicy } from "../../../domain-modules/route/domain/policies/route-planning.policy";
import { RouteId } from "../../../domain-modules/route/domain/route-id";
import { RouteStopId } from "../../../domain-modules/route/domain/route-stop-id";
import { Route } from "../../../domain-modules/route/domain/route.aggregate";
import {
  RouteRepository,
  type LoadedRoute,
} from "../../../domain-modules/route/domain/route.repository";
import { RouteStop } from "../../../domain-modules/route/domain/route-stop.aggregate";
import {
  RouteStopRepository,
  type LoadedRouteStop,
} from "../../../domain-modules/route/domain/route-stop.repository";
import { Shipment } from "../../../domain-modules/shipment/domain/shipment.aggregate";
import { ShipmentId } from "../../../domain-modules/shipment/domain/shipment-id";
import {
  ShipmentRepository,
  type LoadedShipment,
} from "../../../domain-modules/shipment/domain/shipment.repository";
import { RouteController } from "./route.controller";

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const tenantId = "00000000-0000-4000-8000-000000000010";
const otherTenantId = "00000000-0000-4000-8000-000000000011";
const shipmentId = "00000000-0000-4000-8000-000000000001";

const testConfig: AppConfig = {
  processRoles: ["api"],
  host: "127.0.0.1",
  port: 3000,
  schemaBaseUri: "https://schemas.example.com",
  database: { url: "postgres://unused", poolMax: 1 },
  authentication: {
    issuer: "route-http-test",
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

class InMemoryRouteRepository extends RouteRepository {
  private readonly records = new Map<
    string,
    { readonly aggregate: Route; revision: number }
  >();

  findById(tenant: string, id: RouteId): Promise<LoadedRoute | null> {
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

  findByIdForUpdate(tenant: string, id: RouteId): Promise<LoadedRoute | null> {
    return this.findById(tenant, id);
  }

  add(tenant: string, route: Route): Promise<void> {
    this.records.set(`${tenant}:${route.id.value}`, {
      aggregate: route,
      revision: 1,
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedRoute): Promise<string> {
    const key = `${tenant}:${loaded.aggregate.id.value}`;
    const record = this.records.get(key);
    if (record === undefined) throw new Error("Route was not loaded.");
    record.revision += 1;
    return Promise.resolve(String(record.revision));
  }
}

class InMemoryRouteStopRepository extends RouteStopRepository {
  private readonly records = new Map<
    string,
    { readonly aggregate: RouteStop; revision: number }
  >();

  findById(tenant: string, id: RouteStopId): Promise<LoadedRouteStop | null> {
    for (const [key, record] of this.records) {
      if (key.endsWith(`:${id.value}`)) {
        return Promise.resolve({
          aggregate: record.aggregate,
          expectedRevision: String(record.revision),
        });
      }
    }
    return Promise.resolve(null);
  }

  findByRouteIdAndSequence(
    tenant: string,
    routeId: RouteId,
    sequence: number,
  ): Promise<LoadedRouteStop | null> {
    const record = this.records.get(`${tenant}:${routeId.value}:${sequence}`);
    return Promise.resolve(
      record === undefined
        ? null
        : {
            aggregate: record.aggregate,
            expectedRevision: String(record.revision),
          },
    );
  }

  findByRouteIdAndSequenceForUpdate(
    tenant: string,
    routeId: RouteId,
    sequence: number,
  ): Promise<LoadedRouteStop | null> {
    return this.findByRouteIdAndSequence(tenant, routeId, sequence);
  }

  findAllByRouteId(
    tenant: string,
    routeId: RouteId,
  ): Promise<readonly LoadedRouteStop[]> {
    const records: LoadedRouteStop[] = [];
    for (const [key, record] of this.records) {
      if (key.startsWith(`${tenant}:${routeId.value}:`)) {
        records.push({
          aggregate: record.aggregate,
          expectedRevision: String(record.revision),
        });
      }
    }
    records.sort((a, b) => a.aggregate.sequence - b.aggregate.sequence);
    return Promise.resolve(records);
  }

  addMany(tenant: string, stops: readonly RouteStop[]): Promise<void> {
    for (const stop of stops) {
      this.records.set(`${tenant}:${stop.routeId.value}:${stop.sequence}`, {
        aggregate: stop,
        revision: 1,
      });
    }
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedRouteStop): Promise<string> {
    const key = `${tenant}:${loaded.aggregate.routeId.value}:${loaded.aggregate.sequence}`;
    const record = this.records.get(key);
    if (record === undefined) throw new Error("Route stop was not loaded.");
    record.revision += 1;
    return Promise.resolve(String(record.revision));
  }
}

class InMemoryShipmentRepository extends ShipmentRepository {
  private readonly shipments = new Map<string, Shipment>();

  constructor() {
    super();
    this.shipments.set(shipmentId, createSeededShipment());
  }

  findById(tenant: string, id: ShipmentId): Promise<LoadedShipment | null> {
    const shipment = this.shipments.get(id.value);
    return Promise.resolve(
      shipment === undefined
        ? null
        : { aggregate: shipment, expectedRevision: "1" },
    );
  }

  findByIds(tenant: string, ids: readonly ShipmentId[]): Promise<Shipment[]> {
    const found: Shipment[] = [];
    for (const id of ids) {
      const shipment = this.shipments.get(id.value);
      if (shipment !== undefined) found.push(shipment);
    }
    return Promise.resolve(found);
  }

  add(tenant: string, shipment: Shipment): Promise<void> {
    this.shipments.set(shipment.id.value, shipment);
    return Promise.resolve();
  }

  save(): Promise<string> {
    return Promise.resolve("1");
  }
}

class InMemoryAssignmentRepository extends AssignmentRepository {
  findById(): Promise<null> {
    return Promise.resolve(null);
  }

  findByIds(): Promise<readonly never[]> {
    return Promise.resolve([]);
  }

  existsActiveForRoute(): Promise<boolean> {
    return Promise.resolve(false);
  }

  existsRunningForRoute(): Promise<boolean> {
    return Promise.resolve(true);
  }

  existsActiveForVehicle(): Promise<boolean> {
    return Promise.resolve(false);
  }

  existsActiveForDriver(): Promise<boolean> {
    return Promise.resolve(false);
  }

  add(): Promise<void> {
    return Promise.resolve();
  }

  save(): Promise<string> {
    return Promise.resolve("1");
  }
}

function createSeededShipment(): Shipment {
  const created = Shipment.create({
    pickup: {
      address: {
        country: "UA",
        city: "Kyiv",
        street: "Halytska",
        buildingNumber: "1",
        postalCode: "02000",
      },
      timeWindow: {
        start: new Date("2026-08-05T07:00:00Z"),
        end: new Date("2026-08-05T09:00:00Z"),
      },
    },
    delivery: {
      address: {
        country: "UA",
        city: "Lviv",
        street: "Horodotska",
        buildingNumber: "2",
        postalCode: "79000",
      },
      timeWindow: {
        start: new Date("2026-08-05T10:00:00Z"),
        end: new Date("2026-08-05T12:00:00Z"),
      },
    },
    weight: { value: 100, unit: WeightUnit.Kilogram },
    dimensions: {
      length: 1,
      width: 1,
      height: 1,
      unit: DimensionUnit.Meter,
    },
  });
  return created;
}

@Module({
  imports: [TestConfigModule, AccessControlModule],
  controllers: [RouteController],
  providers: [
    HttpExceptionFilter,
    CreateRouteHandler,
    StartRouteHandler,
    StartRouteStopHandler,
    RecordRouteStopArrivalHandler,
    RecordRouteStopDepartureHandler,
    CompleteRouteHandler,
    CancelRouteHandler,
    RoutePlanningPolicy,
    { provide: RouteRepository, useClass: InMemoryRouteRepository },
    { provide: RouteStopRepository, useClass: InMemoryRouteStopRepository },
    { provide: ShipmentRepository, useClass: InMemoryShipmentRepository },
    { provide: AssignmentRepository, useClass: InMemoryAssignmentRepository },
    { provide: TransactionManager, useClass: InMemoryTransactionManager },
    { provide: DomainEventBus, useClass: DiscardingDomainEventBus },
    {
      provide: InternalApplicationEventBus,
      useValue: { publish: async () => {} },
    },
  ],
})
class RouteHttpTestModule {}

function createRouteRequest() {
  return {
    stops: [
      {
        shipmentId,
        operationType: "PICKUP",
        plannedArrivalAt: "2026-08-05T08:00:00.000Z",
        plannedDepartureAt: "2026-08-05T09:00:00.000Z",
      },
      {
        shipmentId,
        operationType: "DELIVERY",
        plannedArrivalAt: "2026-08-05T10:00:00.000Z",
        plannedDepartureAt: "2026-08-05T11:00:00.000Z",
      },
    ],
  };
}

test("Route HTTP slice authenticates, validates, authorizes and executes every use case", async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    RouteHttpTestModule,
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
      url: "/api/v1/routes",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.match(
      unauthenticated.headers["content-type"] ?? "",
      /application\/problem\+json/,
    );

    const unexpectedField = await app.inject({
      method: "POST",
      url: "/api/v1/routes",
      headers: authorization,
      payload: { ...createRouteRequest(), unexpected: true },
    });
    assert.equal(unexpectedField.statusCode, 400);
    assert.equal(
      unexpectedField.json().type,
      "urn:problem:logistics:request.validation",
    );

    const invalidOperationType = await app.inject({
      method: "POST",
      url: "/api/v1/routes",
      headers: authorization,
      payload: {
        stops: [
          { ...createRouteRequest().stops[0], operationType: "LOADING" },
          createRouteRequest().stops[1],
        ],
      },
    });
    assert.equal(invalidOperationType.statusCode, 400);

    const created = await app.inject({
      method: "POST",
      url: "/api/v1/routes",
      headers: authorization,
      payload: createRouteRequest(),
    });
    assert.equal(created.statusCode, 201);
    const routeId = created.json().id as string;
    assert.ok(routeId.length > 0);

    const started = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/start`,
      headers: authorization,
    });
    assert.equal(started.statusCode, 204);

    const stopStarted = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/stops/1/start`,
      headers: authorization,
    });
    assert.equal(stopStarted.statusCode, 204);

    const arrival = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/stops/1/arrival`,
      headers: authorization,
      payload: { arrivedAt: "2026-08-05T08:10:00.000Z" },
    });
    assert.equal(arrival.statusCode, 204);

    const departure = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/stops/1/departure`,
      headers: authorization,
      payload: { departedAt: "2026-08-05T08:45:00.000Z" },
    });
    assert.equal(departure.statusCode, 204);

    const secondStopStarted = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/stops/2/start`,
      headers: authorization,
    });
    assert.equal(secondStopStarted.statusCode, 204);

    const secondArrival = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/stops/2/arrival`,
      headers: authorization,
      payload: { arrivedAt: "2026-08-05T10:10:00.000Z" },
    });
    assert.equal(secondArrival.statusCode, 204);

    const secondDeparture = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/stops/2/departure`,
      headers: authorization,
      payload: { departedAt: "2026-08-05T10:45:00.000Z" },
    });
    assert.equal(secondDeparture.statusCode, 204);

    const completed = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${routeId}/completion`,
      headers: authorization,
    });
    assert.equal(completed.statusCode, 204);

    const secondCreated = await app.inject({
      method: "POST",
      url: "/api/v1/routes",
      headers: authorization,
      payload: createRouteRequest(),
    });
    assert.equal(secondCreated.statusCode, 201);
    const secondRouteId = secondCreated.json().id as string;

    const outOfOrderStop = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${secondRouteId}/stops/1/start`,
      headers: authorization,
    });
    assert.equal(outOfOrderStop.statusCode, 422);
    assert.equal(
      outOfOrderStop.json().type,
      "urn:problem:logistics:domain.rule-violation",
    );

    const cancelled = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${secondRouteId}/cancellation`,
      headers: authorization,
    });
    assert.equal(cancelled.statusCode, 204);

    const tenantIsolated = await app.inject({
      method: "PUT",
      url: `/api/v1/routes/${secondRouteId}`,
      headers: { authorization: `Bearer ${otherTenantToken}` },
    });
    assert.equal(tenantIsolated.statusCode, 404);
  } finally {
    await app.close();
  }
});