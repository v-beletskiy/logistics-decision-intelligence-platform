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
  VolumeUnit,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import { CancelAssignmentHandler } from "../../../app/assignment/commands/cancel-assignment/cancel-assignment.handler";
import { CompleteAssignmentHandler } from "../../../app/assignment/commands/complete-assignment/complete-assignment.handler";
import { CreateAssignmentHandler } from "../../../app/assignment/commands/create-assignment/create-assignment.handler";
import { ReassignDriverHandler } from "../../../app/assignment/commands/reassign-driver/reassign-driver.handler";
import { ReassignVehicleHandler } from "../../../app/assignment/commands/reassign-vehicle/reassign-vehicle.handler";
import { StartAssignmentHandler } from "../../../app/assignment/commands/start-assignment/start-assignment.handler";
import { Assignment } from "../../../domain-modules/assignment/domain/assignment.aggregate";
import { AssignmentId } from "../../../domain-modules/assignment/domain/assignment-id";
import {
  AssignmentRepository,
  type LoadedAssignment,
} from "../../../domain-modules/assignment/domain/assignment.repository";
import { AssignmentPlanningPolicy } from "../../../domain-modules/assignment/domain/policies/assignment-planning.policy";
import { Driver } from "../../../domain-modules/driver/domain/driver.aggregate";
import { DriverId } from "../../../domain-modules/driver/domain/driver-id";
import {
  DriverRepository,
  type LoadedDriver,
} from "../../../domain-modules/driver/domain/driver.repository";
import { RouteId } from "../../../domain-modules/route/domain/route-id";
import { Route } from "../../../domain-modules/route/domain/route.aggregate";
import {
  RouteRepository,
  type LoadedRoute,
} from "../../../domain-modules/route/domain/route.repository";
import { RouteStop } from "../../../domain-modules/route/domain/route-stop.aggregate";
import { RouteStopOperationType } from "../../../domain-modules/route/domain/route-stop.aggregate";
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
import {
  CompartmentType,
  Vehicle,
} from "../../../domain-modules/vehicle/domain/vehicle.aggregate";
import { VehicleId } from "../../../domain-modules/vehicle/domain/vehicle-id";
import {
  VehicleRepository,
  type LoadedVehicle,
} from "../../../domain-modules/vehicle/domain/vehicle.repository";
import { AssignmentController } from "./assignment.controller";

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
    issuer: "assignment-http-test",
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
  private readonly records = new Map<string, LoadedRoute>();

  findById(tenant: string, id: RouteId): Promise<LoadedRoute | null> {
    return Promise.resolve(this.records.get(`${tenant}:${id.value}`) ?? null);
  }

  findByIdForUpdate(tenant: string, id: RouteId): Promise<LoadedRoute | null> {
    return this.findById(tenant, id);
  }

  add(tenant: string, route: Route): Promise<void> {
    this.records.set(`${tenant}:${route.id.value}`, {
      aggregate: route,
      expectedRevision: "1",
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedRoute): Promise<string> {
    this.records.set(`${tenant}:${loaded.aggregate.id.value}`, {
      ...loaded,
      expectedRevision: "2",
    });
    return Promise.resolve("2");
  }
}

class InMemoryRouteStopRepository extends RouteStopRepository {
  private readonly records = new Map<string, LoadedRouteStop>();

  findById(): Promise<LoadedRouteStop | null> {
    return Promise.resolve(null);
  }

  findByRouteIdAndSequence(): Promise<LoadedRouteStop | null> {
    return Promise.resolve(null);
  }

  findByRouteIdAndSequenceForUpdate(): Promise<LoadedRouteStop | null> {
    return Promise.resolve(null);
  }

  findAllByRouteId(
    tenant: string,
    routeId: RouteId,
  ): Promise<readonly LoadedRouteStop[]> {
    const stops: LoadedRouteStop[] = [];
    for (const [key, record] of this.records) {
      if (key.startsWith(`${tenant}:${routeId.value}:`)) {
        stops.push(record);
      }
    }
    stops.sort((a, b) => a.aggregate.sequence - b.aggregate.sequence);
    return Promise.resolve(stops);
  }

  addMany(tenant: string, stops: readonly RouteStop[]): Promise<void> {
    for (const stop of stops) {
      this.records.set(`${tenant}:${stop.routeId.value}:${stop.sequence}`, {
        aggregate: stop,
        expectedRevision: "1",
      });
    }
    return Promise.resolve();
  }

  save(): Promise<string> {
    return Promise.resolve("2");
  }
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

class InMemoryDriverRepository extends DriverRepository {
  private readonly records = new Map<string, LoadedDriver>();

  findById(tenant: string, id: DriverId): Promise<LoadedDriver | null> {
    return Promise.resolve(this.records.get(`${tenant}:${id.value}`) ?? null);
  }

  findByIdForUpdate(tenant: string, id: DriverId): Promise<LoadedDriver | null> {
    return this.findById(tenant, id);
  }

  add(tenant: string, driver: Driver): Promise<void> {
    this.records.set(`${tenant}:${driver.id.value}`, {
      aggregate: driver,
      expectedRevision: "1",
    });
    return Promise.resolve();
  }

  save(): Promise<string> {
    return Promise.resolve("2");
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
  private readonly records = new Map<string, LoadedAssignment>();

  findById(tenant: string, id: AssignmentId): Promise<LoadedAssignment | null> {
    return Promise.resolve(this.records.get(`${tenant}:${id.value}`) ?? null);
  }

  findByIds(): Promise<readonly Assignment[]> {
    return Promise.resolve([]);
  }

  existsActiveForRoute(): Promise<boolean> {
    return Promise.resolve(false);
  }

  existsRunningForRoute(): Promise<boolean> {
    return Promise.resolve(false);
  }

  existsActiveForVehicle(): Promise<boolean> {
    return Promise.resolve(false);
  }

  existsActiveForDriver(): Promise<boolean> {
    return Promise.resolve(false);
  }

  add(tenant: string, assignment: Assignment): Promise<void> {
    this.records.set(`${tenant}:${assignment.id.value}`, {
      aggregate: assignment,
      expectedRevision: "1",
    });
    return Promise.resolve();
  }

  save(tenant: string, loaded: LoadedAssignment): Promise<string> {
    this.records.set(`${tenant}:${loaded.aggregate.id.value}`, {
      ...loaded,
      expectedRevision: "2",
    });
    return Promise.resolve("2");
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

function createSeededVehicle(): Vehicle {
  return Vehicle.register({
    registrationNumber: "AA1234BC",
    name: "Truck 1",
    compartments: [
      {
        type: CompartmentType.DryCargo,
        name: "Main",
        capacity: {
          maxWeight: { value: 2000, unit: WeightUnit.Kilogram },
          maxItemDimensions: {
            length: 3,
            width: 3,
            height: 3,
            unit: DimensionUnit.Meter,
          },
          maxVolume: { value: 20, unit: VolumeUnit.CubicMeter },
        },
      },
    ],
  });
}

function createSeededDriver(): Driver {
  return Driver.register({
    firstName: "Ivan",
    lastName: "Petrenko",
    licenseNumber: "AA11111",
  });
}

@Module({
  imports: [TestConfigModule, AccessControlModule],
  controllers: [AssignmentController],
  providers: [
    HttpExceptionFilter,
    CreateAssignmentHandler,
    StartAssignmentHandler,
    CompleteAssignmentHandler,
    CancelAssignmentHandler,
    ReassignVehicleHandler,
    ReassignDriverHandler,
    AssignmentPlanningPolicy,
    { provide: RouteRepository, useClass: InMemoryRouteRepository },
    { provide: RouteStopRepository, useClass: InMemoryRouteStopRepository },
    { provide: VehicleRepository, useClass: InMemoryVehicleRepository },
    { provide: DriverRepository, useClass: InMemoryDriverRepository },
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
class AssignmentHttpTestModule {}

test("Assignment HTTP slice authenticates, validates, authorizes and executes every use case", async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AssignmentHttpTestModule,
    new FastifyAdapter(),
    { logger: false },
  );
  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  try {
    const route = Route.create({ plannedStopCount: 2 });
    const routeStops = [
      RouteStop.create({
        routeId: route.id,
        shipmentId: ShipmentId.from(shipmentId),
        operationType: RouteStopOperationType.Pickup,
        plannedArrivalAt: new Date("2026-08-05T08:00:00Z"),
        plannedDepartureAt: new Date("2026-08-05T09:00:00Z"),
        sequence: 1,
      }),
      RouteStop.create({
        routeId: route.id,
        shipmentId: ShipmentId.from(shipmentId),
        operationType: RouteStopOperationType.Delivery,
        plannedArrivalAt: new Date("2026-08-05T10:00:00Z"),
        plannedDepartureAt: new Date("2026-08-05T11:00:00Z"),
        sequence: 2,
      }),
    ];
    const vehicle = createSeededVehicle();
    const vehicle2 = createSeededVehicle();
    const driver = createSeededDriver();
    const driver2 = createSeededDriver();

    const routeRepository = app.get(RouteRepository);
    const routeStopRepository = app.get(RouteStopRepository);
    const vehicleRepository = app.get(VehicleRepository);
    const driverRepository = app.get(DriverRepository);
    await routeRepository.add(tenantId, route);
    await routeStopRepository.addMany(tenantId, routeStops);
    await vehicleRepository.add(tenantId, vehicle);
    await vehicleRepository.add(tenantId, vehicle2);
    await driverRepository.add(tenantId, driver);
    await driverRepository.add(tenantId, driver2);

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
    const createPayload = {
      routeId: route.id.value,
      vehicleId: vehicle.id.value,
      driverId: driver.id.value,
    };

    const unauthenticated = await app.inject({
      method: "POST",
      url: "/api/v1/assignments",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.match(
      unauthenticated.headers["content-type"] ?? "",
      /application\/problem\+json/,
    );

    const unexpectedField = await app.inject({
      method: "POST",
      url: "/api/v1/assignments",
      headers: authorization,
      payload: { ...createPayload, unexpected: true },
    });
    assert.equal(unexpectedField.statusCode, 400);
    assert.equal(
      unexpectedField.json().type,
      "urn:problem:logistics:request.validation",
    );

    const created = await app.inject({
      method: "POST",
      url: "/api/v1/assignments",
      headers: authorization,
      payload: createPayload,
    });
    assert.equal(created.statusCode, 201, created.body);
    const assignmentId = created.json().id as string;
    assert.ok(assignmentId.length > 0);

    const vehicleReassigned = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${assignmentId}/vehicle`,
      headers: authorization,
      payload: { vehicleId: vehicle2.id.value },
    });
    assert.equal(vehicleReassigned.statusCode, 204);

    const driverReassigned = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${assignmentId}/driver`,
      headers: authorization,
      payload: { driverId: driver2.id.value },
    });
    assert.equal(driverReassigned.statusCode, 204);

    const started = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${assignmentId}/start`,
      headers: authorization,
    });
    assert.equal(started.statusCode, 204);

    const completed = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${assignmentId}/completion`,
      headers: authorization,
    });
    assert.equal(completed.statusCode, 204);

    const secondCreated = await app.inject({
      method: "POST",
      url: "/api/v1/assignments",
      headers: authorization,
      payload: createPayload,
    });
    assert.equal(secondCreated.statusCode, 201);
    const secondAssignmentId = secondCreated.json().id as string;

    const completedBeforeStart = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${secondAssignmentId}/completion`,
      headers: authorization,
    });
    assert.equal(completedBeforeStart.statusCode, 422);
    assert.equal(
      completedBeforeStart.json().type,
      "urn:problem:logistics:domain.rule-violation",
    );

    const cancelled = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${secondAssignmentId}/cancellation`,
      headers: authorization,
    });
    assert.equal(cancelled.statusCode, 204);

    const tenantIsolated = await app.inject({
      method: "PUT",
      url: `/api/v1/assignments/${secondAssignmentId}`,
      headers: { authorization: `Bearer ${otherTenantToken}` },
    });
    assert.equal(tenantIsolated.statusCode, 404);
  } finally {
    await app.close();
  }
});