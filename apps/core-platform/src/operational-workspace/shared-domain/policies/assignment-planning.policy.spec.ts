import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  Dimensions,
  VolumeUnit,
  Weight,
  WeightUnit,
} from "../../../shared/domain/shared-kernel/value-objects/measurement";

import {
  Assignment,
  AssignmentStatus,
} from "../../domain-modules/assignment/domain/assignment.aggregate";
import { AssignmentId } from "../../domain-modules/assignment/domain/assignment-id";
import { AssignmentShipment } from "../../domain-modules/assignment/domain/assignment-shipment.entity";
import {
  Driver,
  DriverStatus,
} from "../../domain-modules/driver/domain/driver.aggregate";
import { DriverId } from "../../domain-modules/driver/domain/driver-id";
import { Route } from "../../domain-modules/route/domain/route.aggregate";
import { RouteId } from "../../domain-modules/route/domain/route-id";
import { ShipmentId } from "../../domain-modules/shipment/domain/shipment-id";
import {
  Compartment,
  CompartmentType,
  Vehicle,
  VehicleStatus,
  type CapacityProps,
} from "../../domain-modules/vehicle/domain/vehicle.aggregate";
import { CompartmentId } from "../../domain-modules/vehicle/domain/compartment-id";
import { VehicleId } from "../../domain-modules/vehicle/domain/vehicle-id";

import {
  AssignmentPlanningPolicy,
  type AssignmentPlanningContext,
  type ShipmentLoad,
} from "./assignment-planning.policy";

const policy = new AssignmentPlanningPolicy();

function createShipmentLoad(
  weight: number,
  weightUnit: WeightUnit,
  length: number,
  width: number,
  height: number,
  dimensionUnit: DimensionUnit = DimensionUnit.Centimeter,
): ShipmentLoad {
  return {
    weight: Weight.create({ value: weight, unit: weightUnit }),
    dimensions: Dimensions.create({
      length,
      width,
      height,
      unit: dimensionUnit,
    }),
  };
}

const capacity: CapacityProps = {
  maxWeight: { value: 1000, unit: WeightUnit.Kilogram },
  maxItemDimensions: {
    length: 200,
    width: 150,
    height: 180,
    unit: DimensionUnit.Centimeter,
  },
  maxVolume: { value: 10, unit: VolumeUnit.CubicMeter },
};

function createVehicle(
  status: VehicleStatus = VehicleStatus.Available,
): Vehicle {
  return Vehicle.reconstitute(VehicleId.generate(), {
    registrationNumber: "AB-1234",
    compartments: [
      Compartment.reconstitute(CompartmentId.generate(), {
        type: CompartmentType.DryCargo,
        capacity,
      }),
    ],
    status,
  });
}

function createMultiCompartmentVehicle(): Vehicle {
  return Vehicle.reconstitute(VehicleId.generate(), {
    registrationNumber: "AB-5678",
    compartments: [
      Compartment.reconstitute(CompartmentId.generate(), {
        type: CompartmentType.DryCargo,
        capacity: {
          maxWeight: { value: 1000, unit: WeightUnit.Kilogram },
          maxItemDimensions: {
            length: 200,
            width: 50,
            height: 50,
            unit: DimensionUnit.Centimeter,
          },
          maxVolume: { value: 10, unit: VolumeUnit.CubicMeter },
        },
      }),
      Compartment.reconstitute(CompartmentId.generate(), {
        type: CompartmentType.DryCargo,
        capacity: {
          maxWeight: { value: 1000, unit: WeightUnit.Kilogram },
          maxItemDimensions: {
            length: 100,
            width: 100,
            height: 100,
            unit: DimensionUnit.Centimeter,
          },
          maxVolume: { value: 10, unit: VolumeUnit.CubicMeter },
        },
      }),
    ],
    status: VehicleStatus.Available,
  });
}

function createDriver(status: DriverStatus = DriverStatus.Available): Driver {
  return Driver.reconstitute(DriverId.generate(), {
    firstName: "John",
    lastName: "Doe",
    licenseNumber: "LIC-001",
    certifications: [],
    status,
  });
}

function createRoute(): Route {
  return Route.create({ plannedStopCount: 2 });
}

const feasibleShipments: readonly ShipmentLoad[] = [
  createShipmentLoad(300, WeightUnit.Kilogram, 120, 100, 140),
];

function emptyContext(): AssignmentPlanningContext {
  return {
    vehicleHasActiveAssignment: false,
    driverHasActiveAssignment: false,
    routeHasActiveAssignment: false,
  };
}

function createdAssignment(): Assignment {
  return Assignment.reconstitute(AssignmentId.generate(), {
    routeId: RouteId.from("550e8400-e29b-41d4-a716-446655440003"),
    vehicleId: VehicleId.from("550e8400-e29b-41d4-a716-446655440004"),
    driverId: DriverId.from("550e8400-e29b-41d4-a716-446655440005"),
    shipments: [
      AssignmentShipment.create({
        shipmentId: ShipmentId.from("550e8400-e29b-41d4-a716-446655440001"),
        weight: Weight.create({ value: 100, unit: WeightUnit.Kilogram }),
        dimensions: Dimensions.create({
          length: 100,
          width: 80,
          height: 120,
          unit: DimensionUnit.Centimeter,
        }),
      }),
    ],
    status: AssignmentStatus.Created,
    assignedAt: new Date("2026-08-01T07:00:00Z"),
  });
}

function assignmentWithShipment(
  dimensions: { length: number; width: number; height: number },
  weightKg: number,
): Assignment {
  return Assignment.reconstitute(AssignmentId.generate(), {
    routeId: RouteId.from("550e8400-e29b-41d4-a716-446655440003"),
    vehicleId: VehicleId.from("550e8400-e29b-41d4-a716-446655440004"),
    driverId: DriverId.from("550e8400-e29b-41d4-a716-446655440005"),
    shipments: [
      AssignmentShipment.create({
        shipmentId: ShipmentId.from("550e8400-e29b-41d4-a716-446655440001"),
        weight: Weight.create({
          value: weightKg,
          unit: WeightUnit.Kilogram,
        }),
        dimensions: Dimensions.create({
          ...dimensions,
          unit: DimensionUnit.Centimeter,
        }),
      }),
    ],
    status: AssignmentStatus.Created,
    assignedAt: new Date("2026-08-01T07:00:00Z"),
  });
}

test("assertCanCreateAssignment accepts a feasible allocation", () => {
  assert.doesNotThrow(() =>
    policy.assertCanCreateAssignment(
      createRoute(),
      createVehicle(),
      createDriver(),
      feasibleShipments,
      emptyContext(),
    ),
  );
});

test("assertCanCreateAssignment rejects an unavailable vehicle", () => {
  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(VehicleStatus.Maintenance),
        createDriver(),
        feasibleShipments,
        emptyContext(),
      ),
    /unavailable vehicle/,
  );
});

test("assertCanCreateAssignment rejects a suspended driver", () => {
  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(DriverStatus.Suspended),
        feasibleShipments,
        emptyContext(),
      ),
    /suspended driver/,
  );
});

test("assertCanCreateAssignment rejects a vehicle already in an active assignment", () => {
  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        feasibleShipments,
        { ...emptyContext(), vehicleHasActiveAssignment: true },
      ),
    /multiple active assignments/,
  );
});

test("assertCanCreateAssignment rejects a driver already in an active assignment", () => {
  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        feasibleShipments,
        { ...emptyContext(), driverHasActiveAssignment: true },
      ),
    /multiple active assignments/,
  );
});

test("assertCanCreateAssignment rejects a route with an active assignment", () => {
  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        feasibleShipments,
        { ...emptyContext(), routeHasActiveAssignment: true },
      ),
    /more than one active assignment/,
  );
});

test("assertCanCreateAssignment rejects shipments exceeding the vehicle weight capacity", () => {
  const heavyShipments: readonly ShipmentLoad[] = [
    createShipmentLoad(800, WeightUnit.Kilogram, 120, 100, 140),
    createShipmentLoad(400, WeightUnit.Kilogram, 120, 100, 140),
  ];

  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        heavyShipments,
        emptyContext(),
      ),
    /exceeds the assigned vehicle capacity/,
  );
});

test("assertCanCreateAssignment rejects shipments exceeding the vehicle volume capacity", () => {
  const bulkyShipments: readonly ShipmentLoad[] = [
    createShipmentLoad(100, WeightUnit.Kilogram, 200, 150, 180),
    createShipmentLoad(100, WeightUnit.Kilogram, 200, 150, 180),
    createShipmentLoad(100, WeightUnit.Kilogram, 200, 150, 180),
  ];

  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        bulkyShipments,
        emptyContext(),
      ),
    /exceeds the assigned vehicle capacity/,
  );
});

test("assertCanCreateAssignment rejects a shipment that does not fit the vehicle dimensions", () => {
  const oversizedShipments: readonly ShipmentLoad[] = [
    createShipmentLoad(100, WeightUnit.Kilogram, 250, 100, 100),
  ];

  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        oversizedShipments,
        emptyContext(),
      ),
    /does not fit within the assigned vehicle capacity/,
  );
});

test("assertCanCreateAssignment accepts a shipment that fits a smaller compartment", () => {
  const shipment: readonly ShipmentLoad[] = [
    createShipmentLoad(100, WeightUnit.Kilogram, 150, 40, 40),
  ];

  assert.doesNotThrow(() =>
    policy.assertCanCreateAssignment(
      createRoute(),
      createMultiCompartmentVehicle(),
      createDriver(),
      shipment,
      emptyContext(),
    ),
  );
});

test("assertCanCreateAssignment rejects a shipment that fits no compartment", () => {
  const shipment: readonly ShipmentLoad[] = [
    createShipmentLoad(100, WeightUnit.Kilogram, 220, 40, 40),
  ];

  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createMultiCompartmentVehicle(),
        createDriver(),
        shipment,
        emptyContext(),
      ),
    /does not fit within the assigned vehicle capacity/,
  );
});

test("assertCanCreateAssignment compares loads across measurement units", () => {
  const imperialShipments: readonly ShipmentLoad[] = [
    createShipmentLoad(3000, WeightUnit.Pound, 100, 100, 100),
  ];

  assert.throws(
    () =>
      policy.assertCanCreateAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        imperialShipments,
        emptyContext(),
      ),
    /exceeds the assigned vehicle capacity/,
  );
});

test("assertVehicleCanBeAssigned rejects an unavailable vehicle", () => {
  assert.throws(
    () =>
      policy.assertVehicleCanBeAssigned(
        createVehicle(VehicleStatus.Unavailable),
        createdAssignment().shipments,
        false,
      ),
    /unavailable vehicle/,
  );
});

test("assertVehicleCanBeAssigned rejects double-booking", () => {
  assert.throws(
    () =>
      policy.assertVehicleCanBeAssigned(
        createVehicle(),
        createdAssignment().shipments,
        true,
      ),
    /multiple active assignments/,
  );
});

test("assertVehicleCanBeAssigned rejects a vehicle that cannot fit the assigned load", () => {
  const oversized = assignmentWithShipment(
    { length: 250, width: 100, height: 100 },
    100,
  );

  assert.throws(
    () =>
      policy.assertVehicleCanBeAssigned(
        createVehicle(),
        oversized.shipments,
        false,
      ),
    /does not fit within the assigned vehicle capacity/,
  );
});

test("assertVehicleCanBeAssigned is side-effect free", () => {
  const assignment = createdAssignment();
  assignment.pullDomainEvents();
  const originalVehicleId = assignment.vehicleId;
  const newVehicle = createVehicle();

  policy.assertVehicleCanBeAssigned(newVehicle, assignment.shipments, false);

  assert.equal(assignment.vehicleId.equals(originalVehicleId), true);
  assert.deepEqual(assignment.pullDomainEvents(), []);
});

test("assertDriverCanBeAssigned rejects a suspended driver", () => {
  assert.throws(
    () =>
      policy.assertDriverCanBeAssigned(
        createDriver(DriverStatus.Suspended),
        false,
      ),
    /suspended driver/,
  );
});

test("assertDriverCanBeAssigned rejects double-booking", () => {
  assert.throws(
    () => policy.assertDriverCanBeAssigned(createDriver(), true),
    /multiple active assignments/,
  );
});

test("assertDriverCanBeAssigned is side-effect free", () => {
  const assignment = createdAssignment();
  assignment.pullDomainEvents();
  const originalDriverId = assignment.driverId;
  const newDriver = createDriver();

  policy.assertDriverCanBeAssigned(newDriver, false);

  assert.equal(assignment.driverId.equals(originalDriverId), true);
  assert.deepEqual(assignment.pullDomainEvents(), []);
});
