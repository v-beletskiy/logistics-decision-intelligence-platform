import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  Dimensions,
  Weight,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";

import {
  Assignment,
  AssignmentStatus,
  type AssignmentProps,
} from "./assignment.aggregate";
import { AssignmentId } from "./assignment-id";
import { AssignmentShipment } from "./assignment-shipment.entity";
import { DriverId } from "../../driver/domain/driver-id";
import { RouteId } from "../../route/domain/route-id";
import { ShipmentId } from "../../shipment/domain/shipment-id";
import { VehicleId } from "../../vehicle/domain/vehicle-id";

const shipmentIdA = ShipmentId.from("550e8400-e29b-41d4-a716-446655440001");
const shipmentIdB = ShipmentId.from("550e8400-e29b-41d4-a716-446655440002");
const routeId = RouteId.from("550e8400-e29b-41d4-a716-446655440003");
const vehicleId = VehicleId.from("550e8400-e29b-41d4-a716-446655440004");
const driverId = DriverId.from("550e8400-e29b-41d4-a716-446655440005");

const shipments = [
  AssignmentShipment.create({
    shipmentId: shipmentIdA,
    weight: Weight.create({ value: 100, unit: WeightUnit.Kilogram }),
    dimensions: Dimensions.create({
      length: 100,
      width: 80,
      height: 120,
      unit: DimensionUnit.Centimeter,
    }),
  }),
  AssignmentShipment.create({
    shipmentId: shipmentIdB,
    weight: Weight.create({ value: 50, unit: WeightUnit.Kilogram }),
    dimensions: Dimensions.create({
      length: 60,
      width: 50,
      height: 80,
      unit: DimensionUnit.Centimeter,
    }),
  }),
];

const props: AssignmentProps = {
  routeId,
  vehicleId,
  driverId,
  shipments,
  status: AssignmentStatus.Created,
  assignedAt: new Date("2026-08-01T07:00:00Z"),
};

test("Assignment registers as created and records creation", () => {
  const assignment = Assignment.create(props);

  assert.equal(assignment.status, AssignmentStatus.Created);
  assert.equal(assignment.routeId.equals(props.routeId), true);
  assert.equal(assignment.vehicleId.equals(props.vehicleId), true);
  assert.equal(assignment.driverId.equals(props.driverId), true);
  assert.equal(assignment.shipments.length, 2);
  assert.equal(assignment.shipments[0].shipmentId.equals(shipmentIdA), true);
  assert.equal(assignment.shipments[1].shipmentId.equals(shipmentIdB), true);
  assert.equal(assignment.getPersistencePlan().isNew, true);
  assert.deepEqual(
    assignment.pullDomainEvents().map((event) => event.type),
    ["AssignmentCreatedDomainEvent"],
  );
});

test("Assignment rejects an unsupported status during reconstitution", () => {
  assert.throws(
    () =>
      Assignment.reconstitute(AssignmentId.generate(), {
        ...props,
        status: "ARCHIVED" as AssignmentStatus,
      }),
    /assignment status is invalid/,
  );
});

test("Assignment rejects missing references", () => {
  assert.throws(
    () =>
      Assignment.reconstitute(AssignmentId.generate(), {
        ...props,
        vehicleId: undefined as unknown as VehicleId,
      }),
    /must reference a vehicle/,
  );
});

test("Assignment rejects a reference of the wrong identifier type", () => {
  assert.throws(
    () =>
      Assignment.reconstitute(AssignmentId.generate(), {
        ...props,
        vehicleId: driverId,
      }),
    /must reference a vehicle/,
  );
});

test("Assignment rejects an empty shipment set", () => {
  assert.throws(
    () =>
      Assignment.reconstitute(AssignmentId.generate(), {
        ...props,
        shipments: [],
      }),
    /at least one shipment/,
  );
});

test("Assignment rejects a duplicated shipment binding", () => {
  assert.throws(
    () =>
      Assignment.reconstitute(AssignmentId.generate(), {
        ...props,
        shipments: [shipments[0], shipments[0]],
      }),
    /same shipment more than once/,
  );
});

test("Assignment reassigns vehicle and driver while created", () => {
  const assignment = Assignment.create(props);
  assignment.pullDomainEvents();
  assignment.assignVehicle(
    VehicleId.from("550e8400-e29b-41d4-a716-446655440006"),
  );
  assignment.assignDriver(
    DriverId.from("550e8400-e29b-41d4-a716-446655440007"),
  );

  assert.deepEqual(
    assignment.pullDomainEvents().map((event) => event.type),
    ["VehicleReassignedDomainEvent", "DriverReassignedDomainEvent"],
  );
});

test("Assignment rejects reassigning with the wrong identifier type", () => {
  const assignment = Assignment.create(props);
  assert.throws(
    () =>
      assignment.assignVehicle(
        DriverId.from("550e8400-e29b-41d4-a716-446655440006"),
      ),
    /must reference a vehicle/,
  );
});

test("Assignment reports whether it is still active", () => {
  const assignment = Assignment.create(props);
  assert.equal(assignment.isActive, true);

  assignment.start();
  assert.equal(assignment.isActive, true);

  assignment.complete();
  assert.equal(assignment.isActive, false);
});

test("Assignment is inactive after cancellation", () => {
  const assignment = Assignment.create(props);
  assignment.cancel();
  assert.equal(assignment.isActive, false);
});

test("Assignment starts, completes and records the lifecycle", () => {
  const assignment = Assignment.create(props);
  assignment.pullDomainEvents();
  assignment.start();

  assert.equal(assignment.status, AssignmentStatus.InProgress);
  assert.ok(assignment.startedAt instanceof Date);

  assignment.complete();

  assert.equal(assignment.status, AssignmentStatus.Completed);
  assert.ok(assignment.completedAt instanceof Date);
  assert.deepEqual(
    assignment.pullDomainEvents().map((event) => event.type),
    ["AssignmentStartedDomainEvent", "AssignmentCompletedDomainEvent"],
  );
});

test("Assignment cannot be completed before starting", () => {
  const assignment = Assignment.create(props);

  assert.throws(() => assignment.complete(), /in-progress assignment/);
});

test("Assignment cannot be started more than once", () => {
  const assignment = Assignment.create(props);
  assignment.start();

  assert.throws(
    () => assignment.start(),
    /Only a created assignment can be started/,
  );
});

test("Assignment cannot reassign once started", () => {
  const assignment = Assignment.create(props);
  assignment.start();

  assert.throws(
    () =>
      assignment.assignVehicle(
        VehicleId.from("550e8400-e29b-41d4-a716-446655440006"),
      ),
    /started assignment cannot be reassigned/,
  );
});

test("Assignment cannot be cancelled after completion", () => {
  const assignment = Assignment.create(props);
  assignment.start();
  assignment.complete();

  assert.throws(
    () => assignment.cancel(),
    /completed assignment cannot be cancelled/,
  );
});

test("Assignment cancels from created state", () => {
  const assignment = Assignment.create(props);
  assignment.pullDomainEvents();
  assignment.cancel();

  assert.equal(assignment.status, AssignmentStatus.Cancelled);
  assert.ok(assignment.cancelledAt instanceof Date);
  assert.deepEqual(
    assignment.pullDomainEvents().map((event) => event.type),
    ["AssignmentCancelledDomainEvent"],
  );
});
