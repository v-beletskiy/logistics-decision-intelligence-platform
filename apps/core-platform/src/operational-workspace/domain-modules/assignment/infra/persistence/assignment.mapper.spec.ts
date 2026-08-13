import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  Assignment,
  AssignmentStatus,
} from "../../domain/assignment.aggregate";
import { AssignmentShipment } from "../../domain/assignment-shipment.entity";
import { DriverId } from "../../../driver/domain/driver-id";
import { RouteId } from "../../../route/domain/route-id";
import { ShipmentId } from "../../../shipment/domain/shipment-id";
import { VehicleId } from "../../../vehicle/domain/vehicle-id";
import {
  DimensionUnit,
  Dimensions,
  Weight,
  WeightUnit,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import {
  AssignmentMapper,
  type AssignmentPersistenceRow,
  type AssignmentShipmentPersistenceData,
} from "./assignment.mapper";

const shipmentId = "550e8400-e29b-41d4-a716-446655440001";
const routeId = "550e8400-e29b-41d4-a716-446655440002";
const vehicleId = "550e8400-e29b-41d4-a716-446655440003";
const driverId = "550e8400-e29b-41d4-a716-446655440004";
const assignmentId = "550e8400-e29b-41d4-a716-446655440000";
const tenantId = "00000000-0000-4000-8000-000000000099";

const shipmentEntity: AssignmentShipmentPersistenceData = {
  id: "550e8400-e29b-41d4-a716-44665544000a",
  shipmentId,
  weight: 100,
  weightUnit: "KILOGRAM",
  length: 100,
  width: 80,
  height: 120,
  dimensionUnit: "CENTIMETER",
};

const assignmentEntity: AssignmentPersistenceRow = {
  id: assignmentId,
  route_id: routeId,
  vehicle_id: vehicleId,
  driver_id: driverId,
  status: "IN_PROGRESS",
  assigned_at: new Date("2026-08-01T07:00:00Z"),
  started_at: new Date("2026-08-01T08:00:00Z"),
  completed_at: null,
  cancelled_at: null,
  shipments: [shipmentEntity],
};

function createShipment(): AssignmentShipment {
  return AssignmentShipment.create({
    shipmentId: ShipmentId.from(shipmentId),
    weight: Weight.create({ value: 100, unit: WeightUnit.Kilogram }),
    dimensions: Dimensions.create({
      length: 100,
      width: 80,
      height: 120,
      unit: DimensionUnit.Centimeter,
    }),
  });
}

test("AssignmentMapper reconstitutes an assignment from its persisted row", () => {
  const assignment = AssignmentMapper.toDomain(assignmentEntity);

  assert.equal(assignment.id.value, assignmentEntity.id);
  assert.equal(assignment.status, AssignmentStatus.InProgress);
  assert.equal(assignment.routeId.equals(RouteId.from(routeId)), true);
  assert.equal(assignment.vehicleId.equals(VehicleId.from(vehicleId)), true);
  assert.equal(assignment.driverId.equals(DriverId.from(driverId)), true);
  assert.equal(assignment.shipments.length, 1);
  assert.equal(
    assignment.shipments[0].shipmentId.equals(ShipmentId.from(shipmentId)),
    true,
  );
  assert.equal(
    assignment.startedAt?.getTime(),
    assignmentEntity.started_at?.getTime(),
  );
  assert.equal(assignment.completedAt, undefined);
});

test("AssignmentMapper maps absent nullable lifecycle columns to undefined", () => {
  const assignment = AssignmentMapper.toDomain({
    ...assignmentEntity,
    status: "CREATED",
    started_at: null,
  });

  assert.equal(assignment.status, AssignmentStatus.Created);
  assert.equal(assignment.startedAt, undefined);
  assert.equal(assignment.cancelledAt, undefined);
});

test("AssignmentMapper derives a clean write model for a loaded assignment", () => {
  const assignment = AssignmentMapper.toDomain(assignmentEntity);

  const persistence = AssignmentMapper.toPersistence(tenantId, assignment);

  assert.equal(persistence.isNew, false);
  assert.deepEqual(persistence.root, {
    tenantId,
    id: assignmentEntity.id,
    routeId,
    vehicleId,
    driverId,
    status: AssignmentStatus.InProgress,
    assignedAt: assignmentEntity.assigned_at,
    startedAt: assignmentEntity.started_at,
    completedAt: null,
    cancelledAt: null,
  });
  assert.deepEqual(persistence.shipmentInserts, []);
  assert.deepEqual(persistence.removedShipmentIds, []);
});

test("AssignmentMapper marks a registration as an insert with its shipments", () => {
  const assignment = Assignment.create({
    routeId: RouteId.from(routeId),
    vehicleId: VehicleId.from(vehicleId),
    driverId: DriverId.from(driverId),
    shipments: [createShipment()],
  });

  const persistence = AssignmentMapper.toPersistence(tenantId, assignment);

  assert.equal(persistence.isNew, true);
  assert.equal(persistence.root.id, assignment.id.value);
  assert.equal(persistence.root.status, AssignmentStatus.Created);
  assert.equal(persistence.root.startedAt, null);
  assert.equal(persistence.root.completedAt, null);
  assert.equal(persistence.root.cancelledAt, null);
  assert.equal(persistence.shipmentInserts.length, 1);
  assert.equal(persistence.shipmentInserts[0].tenantId, tenantId);
  assert.equal(persistence.shipmentInserts[0].shipmentId, shipmentId);
  assert.equal(
    persistence.shipmentInserts[0].assignmentId,
    assignment.id.value,
  );
  assert.equal(persistence.shipmentInserts[0].weight, 100);
  assert.equal(persistence.shipmentInserts[0].dimensionUnit, "CENTIMETER");
});

test("AssignmentMapper round-trips an assignment through its persisted shape", () => {
  const original = Assignment.create({
    routeId: RouteId.from(routeId),
    vehicleId: VehicleId.from(vehicleId),
    driverId: DriverId.from(driverId),
    shipments: [createShipment()],
  });
  original.start();
  original.complete();

  const persistence = AssignmentMapper.toPersistence(tenantId, original);
  const entity: AssignmentPersistenceRow = {
    id: persistence.root.id,
    route_id: persistence.root.routeId,
    vehicle_id: persistence.root.vehicleId,
    driver_id: persistence.root.driverId,
    status: persistence.root.status,
    assigned_at: persistence.root.assignedAt as Date,
    started_at: (persistence.root.startedAt as Date | null) ?? null,
    completed_at: (persistence.root.completedAt as Date | null) ?? null,
    cancelled_at: (persistence.root.cancelledAt as Date | null) ?? null,
    shipments: persistence.shipmentInserts.map((insert) => ({
      id: insert.id as string,
      shipmentId: insert.shipmentId as string,
      weight: insert.weight as number,
      weightUnit: insert.weightUnit as string,
      length: insert.length as number,
      width: insert.width as number,
      height: insert.height as number,
      dimensionUnit: insert.dimensionUnit as string,
    })),
  };

  const roundTripped = AssignmentMapper.toDomain(entity);

  assert.equal(roundTripped.id.value, original.id.value);
  assert.equal(roundTripped.status, original.status);
  assert.equal(roundTripped.vehicleId.equals(original.vehicleId), true);
  assert.equal(roundTripped.driverId.equals(original.driverId), true);
  assert.equal(roundTripped.shipments.length, 1);
  assert.ok(roundTripped.completedAt instanceof Date);
});
