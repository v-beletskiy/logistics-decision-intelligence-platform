import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import {
  DimensionUnit,
  Dimensions,
  Weight,
  WeightUnit,
} from "../../../../../../../shared/domain/value-objects/measurement";
import { DriverId } from "../../../../driver/domain/driver-id";
import { RouteId } from "../../../../route/domain/route-id";
import { ShipmentId } from "../../../../shipment/domain/shipment-id";
import { VehicleId } from "../../../../vehicle/domain/vehicle-id";
import { Assignment } from "../../../domain/assignment.aggregate";
import { AssignmentShipment } from "../../../domain/assignment-shipment.entity";
import { insertAssignment } from "./queries/assignment.insert.queries";
import { reconcileAssignmentShipments } from "./queries/assignment.reconcile-shipments.queries";
import { updateAssignment } from "./queries/assignment.update.queries";
import { PgAssignmentRepository } from "./pg-assignment.repository";

const tenantId = "00000000-0000-4000-8000-000000000010";

function createAssignment(): Assignment {
  return Assignment.create({
    routeId: RouteId.from("00000000-0000-4000-8000-000000000011"),
    vehicleId: VehicleId.from("00000000-0000-4000-8000-000000000012"),
    driverId: DriverId.from("00000000-0000-4000-8000-000000000013"),
    shipments: [
      AssignmentShipment.create({
        shipmentId: ShipmentId.from("00000000-0000-4000-8000-000000000014"),
        weight: Weight.create({ value: 100, unit: WeightUnit.Kilogram }),
        dimensions: Dimensions.create({
          length: 1,
          width: 1,
          height: 1,
          unit: DimensionUnit.Meter,
        }),
      }),
    ],
  });
}

function trackedDatabase(
  options: {
    readonly insertError?: unknown;
    readonly updateError?: unknown;
  } = {},
): {
  database: PgDatabase;
  calls: readonly unknown[];
} {
  const calls: unknown[] = [];
  const database = {
    exec: async (statement: unknown) => {
      calls.push(statement);
      if (statement === insertAssignment && options.insertError !== undefined) {
        throw options.insertError;
      }
      if (statement === updateAssignment) {
        if (options.updateError !== undefined) throw options.updateError;
        return [{ revision: "2" }];
      }
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

const activeAssignmentConstraints = [
  "assignments_tenant_active_vehicle_unique",
  "assignments_tenant_active_driver_unique",
  "assignments_tenant_active_route_unique",
] as const;

for (const constraint of activeAssignmentConstraints) {
  test(`add translates ${constraint} into a concurrency conflict`, async () => {
    const conflict = { code: "23505", constraint };
    const { database, calls } = trackedDatabase({ insertError: conflict });

    await assert.rejects(
      new PgAssignmentRepository(database).add(tenantId, createAssignment()),
      ConcurrencyConflictException,
    );
    assert.deepEqual(calls, [insertAssignment]);
  });
}

test("add propagates unknown database constraints", async () => {
  const conflict = { code: "23505", constraint: "assignments_pkey" };
  const { database, calls } = trackedDatabase({ insertError: conflict });

  await assert.rejects(
    new PgAssignmentRepository(database).add(tenantId, createAssignment()),
    (error: unknown) => error === conflict,
  );
  assert.deepEqual(calls, [insertAssignment]);
});

test("add reconciles shipments after inserting the root", async () => {
  const { database, calls } = trackedDatabase();

  await new PgAssignmentRepository(database).add(tenantId, createAssignment());

  assert.deepEqual(calls, [insertAssignment, reconcileAssignmentShipments]);
});

test("save translates an active-assignment uniqueness race", async () => {
  const conflict = {
    code: "23505",
    constraint: "assignments_tenant_active_vehicle_unique",
  };
  const { database, calls } = trackedDatabase({ updateError: conflict });

  await assert.rejects(
    new PgAssignmentRepository(database).save(tenantId, {
      aggregate: createAssignment(),
      expectedRevision: "1",
    }),
    ConcurrencyConflictException,
  );
  assert.deepEqual(calls, [updateAssignment]);
});
