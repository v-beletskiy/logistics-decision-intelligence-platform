import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  Dimensions,
  Weight,
  WeightUnit,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import {
  Assignment,
  AssignmentStatus,
} from "../../domain/assignment.aggregate";
import { AssignmentId } from "../../domain/assignment-id";
import { AssignmentShipment } from "../../domain/assignment-shipment.entity";
import { DriverId } from "../../../driver/domain/driver-id";
import { RouteId } from "../../../route/domain/route-id";
import { ShipmentId } from "../../../shipment/domain/shipment-id";
import { VehicleId } from "../../../vehicle/domain/vehicle-id";
import { insertAssignment } from "./queries/assignment.insert.queries";
import { insertAssignmentShipments } from "./queries/assignment.insert-shipments.queries";
import { updateAssignment } from "./queries/assignment.update.queries";
import { existsActiveAssignmentForDriver } from "./queries/assignment.exists-active-for-driver.queries";
import { existsActiveAssignmentForRoute } from "./queries/assignment.exists-active-for-route.queries";
import { existsActiveAssignmentForVehicle } from "./queries/assignment.exists-active-for-vehicle.queries";
import { existsRunningAssignmentForRoute } from "./queries/assignment.exists-running-for-route.queries";
import { PgAssignmentRepository } from "./assignment.pg-repository";

const tenantId = "00000000-0000-4000-8000-000000000099";

const shipmentId = ShipmentId.from("550e8400-e29b-41d4-a716-446655440001");
const routeId = RouteId.from("550e8400-e29b-41d4-a716-446655440002");
const vehicleId = VehicleId.from("550e8400-e29b-41d4-a716-446655440003");
const driverId = DriverId.from("550e8400-e29b-41d4-a716-446655440004");

function trackedDatabase(): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

function createShipment(): AssignmentShipment {
  return AssignmentShipment.create({
    shipmentId,
    weight: Weight.create({ value: 100, unit: WeightUnit.Kilogram }),
    dimensions: Dimensions.create({
      length: 100,
      width: 80,
      height: 120,
      unit: DimensionUnit.Centimeter,
    }),
  });
}

function createAssignment(): Assignment {
  return Assignment.create({
    routeId,
    vehicleId,
    driverId,
    shipments: [createShipment()],
  });
}

function loadPersistedAssignment(): Assignment {
  return Assignment.reconstitute(
    AssignmentId.from("00000000-0000-4000-8000-000000000001"),
    {
      routeId,
      vehicleId,
      driverId,
      shipments: [createShipment()],
      status: AssignmentStatus.Created,
      assignedAt: new Date("2026-08-01T07:00:00Z"),
    },
  );
}

test("save inserts the assignment row and its shipments on registration", async () => {
  const assignment = createAssignment();
  const { database, calls } = trackedDatabase();
  const repository = new PgAssignmentRepository(database);

  await repository.save(tenantId, assignment);

  assert.equal(
    calls.filter((call) => call.statement === insertAssignment).length,
    1,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateAssignment).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === insertAssignmentShipments).length,
    1,
  );
  const insert = calls.find((call) => call.statement === insertAssignment);
  const params = insert!.params as {
    tenantId: string;
    id: string;
    status: string;
  };
  assert.equal(params.tenantId, tenantId);
  assert.equal(params.id, assignment.id.value);
  assert.equal(params.status, AssignmentStatus.Created);
  const shipments = calls.find(
    (call) => call.statement === insertAssignmentShipments,
  );
  const shipmentParams = shipments!.params as {
    rows: readonly {
      tenantId: string;
      assignmentId: string;
      shipmentId: string;
    }[];
  };
  assert.equal(shipmentParams.rows.length, 1);
  assert.equal(shipmentParams.rows[0].tenantId, tenantId);
  assert.equal(shipmentParams.rows[0].assignmentId, assignment.id.value);
  assert.equal(shipmentParams.rows[0].shipmentId, shipmentId.value);
});

test("save updates the assignment row when a loaded assignment changes", async () => {
  const assignment = loadPersistedAssignment();
  assignment.start();
  const { database, calls } = trackedDatabase();
  const repository = new PgAssignmentRepository(database);

  await repository.save(tenantId, assignment);

  assert.equal(
    calls.filter((call) => call.statement === insertAssignment).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateAssignment).length,
    1,
  );
  assert.equal(
    calls.filter((call) => call.statement === insertAssignmentShipments).length,
    0,
  );
  const update = calls.find((call) => call.statement === updateAssignment);
  const params = update!.params as { status: string; startedAt: Date | null };
  assert.equal(params.status, AssignmentStatus.InProgress);
  assert.ok(params.startedAt instanceof Date);
});

test("save updates the assignment row after completion", async () => {
  const assignment = loadPersistedAssignment();
  assignment.start();
  assignment.complete();
  const { database, calls } = trackedDatabase();
  const repository = new PgAssignmentRepository(database);

  await repository.save(tenantId, assignment);

  const update = calls.find((call) => call.statement === updateAssignment);
  const params = update!.params as { status: string; completedAt: Date | null };
  assert.equal(params.status, AssignmentStatus.Completed);
  assert.ok(params.completedAt instanceof Date);
});

test("assignment existence checks use scoped queries without hydrating aggregates", async () => {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      return [{ exists: statement !== existsActiveAssignmentForRoute }];
    },
  } as unknown as PgDatabase;
  const repository = new PgAssignmentRepository(database);

  assert.equal(await repository.existsActiveForVehicle(tenantId, vehicleId), true);
  assert.equal(await repository.existsActiveForDriver(tenantId, driverId), true);
  assert.equal(await repository.existsActiveForRoute(tenantId, routeId), false);
  assert.equal(await repository.existsRunningForRoute(tenantId, routeId), true);
  assert.deepEqual(calls, [
    {
      statement: existsActiveAssignmentForVehicle,
      params: { tenantId, vehicleId: vehicleId.value },
    },
    {
      statement: existsActiveAssignmentForDriver,
      params: { tenantId, driverId: driverId.value },
    },
    {
      statement: existsActiveAssignmentForRoute,
      params: { tenantId, routeId: routeId.value },
    },
    {
      statement: existsRunningAssignmentForRoute,
      params: { tenantId, routeId: routeId.value },
    },
  ]);
});
