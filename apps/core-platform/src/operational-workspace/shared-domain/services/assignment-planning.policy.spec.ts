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
import { RouteStopOperationType } from "../../domain-modules/route/domain/route-stop.entity";
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
    status,
  });
}

function createRoute(): Route {
  return Route.create({
    stops: [
      {
        shipmentId: "550e8400-e29b-41d4-a716-446655440001",
        operationType: RouteStopOperationType.Pickup,
        schedule: {
          arrivalTime: new Date("2026-08-01T07:00:00Z"),
          departureTime: new Date("2026-08-01T07:30:00Z"),
        },
      },
      {
        shipmentId: "550e8400-e29b-41d4-a716-446655440001",
        operationType: RouteStopOperationType.Delivery,
        schedule: {
          arrivalTime: new Date("2026-08-01T12:00:00Z"),
          departureTime: new Date("2026-08-01T12:30:00Z"),
        },
      },
    ],
  });
}

const feasibleShipments: readonly ShipmentLoad[] = [
  {
    weight: { value: 300, unit: WeightUnit.Kilogram },
    dimensions: {
      length: 120,
      width: 100,
      height: 140,
      unit: DimensionUnit.Centimeter,
    },
  },
];

function emptyContext(): AssignmentPlanningContext {
  return {
    activeAssignmentByVehicle: null,
    activeAssignmentByDriver: null,
    activeAssignmentByRoute: null,
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

test("planAssignment accepts a feasible allocation", () => {
  assert.doesNotThrow(() =>
    policy.planAssignment(
      createRoute(),
      createVehicle(),
      createDriver(),
      feasibleShipments,
      emptyContext(),
    ),
  );
});

test("planAssignment rejects an unavailable vehicle", () => {
  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(VehicleStatus.Maintenance),
        createDriver(),
        feasibleShipments,
        emptyContext(),
      ),
    /unavailable vehicle/,
  );
});

test("planAssignment rejects a suspended driver", () => {
  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(DriverStatus.Suspended),
        feasibleShipments,
        emptyContext(),
      ),
    /suspended driver/,
  );
});

test("planAssignment rejects a vehicle already in an active assignment", () => {
  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        feasibleShipments,
        { ...emptyContext(), activeAssignmentByVehicle: createdAssignment() },
      ),
    /multiple active assignments/,
  );
});

test("planAssignment rejects a driver already in an active assignment", () => {
  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        feasibleShipments,
        { ...emptyContext(), activeAssignmentByDriver: createdAssignment() },
      ),
    /multiple active assignments/,
  );
});

test("planAssignment rejects a route with an active assignment", () => {
  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        feasibleShipments,
        { ...emptyContext(), activeAssignmentByRoute: createdAssignment() },
      ),
    /more than one active assignment/,
  );
});

test("planAssignment rejects shipments exceeding the vehicle weight capacity", () => {
  const heavyShipments: readonly ShipmentLoad[] = [
    {
      weight: { value: 800, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 120,
        width: 100,
        height: 140,
        unit: DimensionUnit.Centimeter,
      },
    },
    {
      weight: { value: 400, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 120,
        width: 100,
        height: 140,
        unit: DimensionUnit.Centimeter,
      },
    },
  ];

  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        heavyShipments,
        emptyContext(),
      ),
    /exceeds the assigned vehicle capacity/,
  );
});

test("planAssignment rejects shipments exceeding the vehicle volume capacity", () => {
  const bulkyShipments: readonly ShipmentLoad[] = [
    {
      weight: { value: 100, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 200,
        width: 150,
        height: 180,
        unit: DimensionUnit.Centimeter,
      },
    },
    {
      weight: { value: 100, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 200,
        width: 150,
        height: 180,
        unit: DimensionUnit.Centimeter,
      },
    },
    {
      weight: { value: 100, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 200,
        width: 150,
        height: 180,
        unit: DimensionUnit.Centimeter,
      },
    },
  ];

  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        bulkyShipments,
        emptyContext(),
      ),
    /exceeds the assigned vehicle capacity/,
  );
});

test("planAssignment rejects a shipment that does not fit the vehicle dimensions", () => {
  const oversizedShipments: readonly ShipmentLoad[] = [
    {
      weight: { value: 100, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 250,
        width: 100,
        height: 100,
        unit: DimensionUnit.Centimeter,
      },
    },
  ];

  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        oversizedShipments,
        emptyContext(),
      ),
    /does not fit within the assigned vehicle capacity/,
  );
});

test("planAssignment accepts a shipment that fits a smaller compartment", () => {
  const shipment: readonly ShipmentLoad[] = [
    {
      weight: { value: 100, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 150,
        width: 40,
        height: 40,
        unit: DimensionUnit.Centimeter,
      },
    },
  ];

  assert.doesNotThrow(() =>
    policy.planAssignment(
      createRoute(),
      createMultiCompartmentVehicle(),
      createDriver(),
      shipment,
      emptyContext(),
    ),
  );
});

test("planAssignment rejects a shipment that fits no compartment", () => {
  const shipment: readonly ShipmentLoad[] = [
    {
      weight: { value: 100, unit: WeightUnit.Kilogram },
      dimensions: {
        length: 220,
        width: 40,
        height: 40,
        unit: DimensionUnit.Centimeter,
      },
    },
  ];

  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createMultiCompartmentVehicle(),
        createDriver(),
        shipment,
        emptyContext(),
      ),
    /does not fit within the assigned vehicle capacity/,
  );
});

test("planAssignment converts measurement units before comparing", () => {
  const imperialShipments: readonly ShipmentLoad[] = [
    {
      weight: { value: 3000, unit: WeightUnit.Pound },
      dimensions: {
        length: 100,
        width: 100,
        height: 100,
        unit: DimensionUnit.Centimeter,
      },
    },
  ];

  assert.throws(
    () =>
      policy.planAssignment(
        createRoute(),
        createVehicle(),
        createDriver(),
        imperialShipments,
        emptyContext(),
      ),
    /exceeds the assigned vehicle capacity/,
  );
});

test("reassignVehicle rejects an unavailable vehicle", () => {
  assert.throws(
    () =>
      policy.reassignVehicle(
        createdAssignment(),
        createVehicle(VehicleStatus.Unavailable),
        null,
      ),
    /unavailable vehicle/,
  );
});

test("reassignVehicle rejects double-booking", () => {
  assert.throws(
    () =>
      policy.reassignVehicle(
        createdAssignment(),
        createVehicle(),
        createdAssignment(),
      ),
    /multiple active assignments/,
  );
});

test("reassignVehicle rejects a vehicle that cannot fit the assigned load", () => {
  const oversized = assignmentWithShipment(
    { length: 250, width: 100, height: 100 },
    100,
  );

  assert.throws(
    () => policy.reassignVehicle(oversized, createVehicle(), null),
    /does not fit within the assigned vehicle capacity/,
  );
});

test("reassignVehicle reassigns a feasible vehicle", () => {
  const assignment = createdAssignment();
  assignment.pullDomainEvents();
  const newVehicle = createVehicle();

  policy.reassignVehicle(assignment, newVehicle, null);

  assert.equal(assignment.vehicleId.equals(newVehicle.id), true);
  assert.deepEqual(
    assignment.pullDomainEvents().map((event) => event.type),
    ["VehicleReassignedDomainEvent"],
  );
});

test("reassignDriver rejects a suspended driver", () => {
  assert.throws(
    () =>
      policy.reassignDriver(
        createdAssignment(),
        createDriver(DriverStatus.Suspended),
        null,
      ),
    /suspended driver/,
  );
});

test("reassignDriver rejects double-booking", () => {
  assert.throws(
    () =>
      policy.reassignDriver(
        createdAssignment(),
        createDriver(),
        createdAssignment(),
      ),
    /multiple active assignments/,
  );
});

test("reassignDriver reassigns an available driver", () => {
  const assignment = createdAssignment();
  assignment.pullDomainEvents();
  const newDriver = createDriver();

  policy.reassignDriver(assignment, newDriver, null);

  assert.equal(assignment.driverId.equals(newDriver.id), true);
  assert.deepEqual(
    assignment.pullDomainEvents().map((event) => event.type),
    ["DriverReassignedDomainEvent"],
  );
});
