import { DomainException } from "../../../shared/domain/shared-kernel/exceptions/domain.exception";
import {
  DimensionUnit,
  Dimensions,
  VolumeUnit,
  WeightUnit,
} from "../../../shared/domain/shared-kernel/value-objects/measurement";

import type { Assignment } from "../../domain-modules/assignment/domain/assignment.aggregate";
import type { Driver } from "../../domain-modules/driver/domain/driver.aggregate";
import { DriverStatus } from "../../domain-modules/driver/domain/driver.aggregate";
import type { Route } from "../../domain-modules/route/domain/route.aggregate";
import { RouteStatus } from "../../domain-modules/route/domain/route.aggregate";
import type { Vehicle } from "../../domain-modules/vehicle/domain/vehicle.aggregate";
import { VehicleStatus } from "../../domain-modules/vehicle/domain/vehicle.aggregate";

/** Load carried by a shipment, sufficient for capacity validation. */
export interface ShipmentLoad {
  readonly weight: { readonly value: number; readonly unit: WeightUnit };
  readonly dimensions: {
    readonly length: number;
    readonly width: number;
    readonly height: number;
    readonly unit: DimensionUnit;
  };
}

/** Active assignments discovered by the application layer before planning. */
export interface AssignmentPlanningContext {
  readonly activeAssignmentByVehicle: Assignment | null;
  readonly activeAssignmentByDriver: Assignment | null;
  readonly activeAssignmentByRoute: Assignment | null;
}

/**
 * Enforcement point for resource-allocation rules across Assignment, Vehicle,
 * Driver and Route. Mutations that depend on external resource availability
 * are exposed as operations here so they cannot be bypassed by direct
 * aggregate calls.
 */
export class AssignmentPlanningPolicy {
  planAssignment(
    route: Route,
    vehicle: Vehicle,
    driver: Driver,
    shipments: readonly ShipmentLoad[],
    context: AssignmentPlanningContext,
  ): void {
    this.validateRoute(route, context.activeAssignmentByRoute);
    this.validateVehicle(vehicle, shipments, context.activeAssignmentByVehicle);
    this.validateDriver(driver, context.activeAssignmentByDriver);
  }

  reassignVehicle(
    assignment: Assignment,
    vehicle: Vehicle,
    activeAssignmentByVehicle: Assignment | null,
  ): void {
    this.validateVehicle(
      vehicle,
      assignment.shipments,
      activeAssignmentByVehicle,
    );
    assignment.assignVehicle(vehicle.id);
  }

  reassignDriver(
    assignment: Assignment,
    driver: Driver,
    activeAssignmentByDriver: Assignment | null,
  ): void {
    this.validateDriver(driver, activeAssignmentByDriver);
    assignment.assignDriver(driver.id);
  }

  private validateVehicle(
    vehicle: Vehicle,
    shipments: readonly ShipmentLoad[],
    activeAssignmentByVehicle: Assignment | null,
  ): void {
    if (vehicle.status !== VehicleStatus.Available) {
      throw new DomainException("An unavailable vehicle cannot be assigned.");
    }
    if (activeAssignmentByVehicle?.isActive) {
      throw new DomainException(
        "A vehicle cannot participate in multiple active assignments simultaneously.",
      );
    }
    this.assertCapacityFits(vehicle, shipments);
  }

  private validateDriver(
    driver: Driver,
    activeAssignmentByDriver: Assignment | null,
  ): void {
    if (driver.status === DriverStatus.Suspended) {
      throw new DomainException("A suspended driver cannot be assigned.");
    }
    if (activeAssignmentByDriver?.isActive) {
      throw new DomainException(
        "A driver cannot participate in multiple active assignments simultaneously.",
      );
    }
  }

  private validateRoute(
    route: Route,
    activeAssignmentByRoute: Assignment | null,
  ): void {
    if (activeAssignmentByRoute?.isActive) {
      throw new DomainException(
        "A route cannot have more than one active assignment simultaneously.",
      );
    }
    if (
      route.status === RouteStatus.Completed ||
      route.status === RouteStatus.Cancelled
    ) {
      throw new DomainException(
        "A completed or cancelled route cannot be assigned.",
      );
    }
  }

  private assertCapacityFits(
    vehicle: Vehicle,
    shipments: readonly ShipmentLoad[],
  ): void {
    if (shipments.length === 0) {
      throw new DomainException(
        "An assignment must contain at least one shipment.",
      );
    }

    const totalWeight = shipments.reduce(
      (sum, shipment) => sum + toKilograms(shipment.weight),
      0,
    );
    const totalVolume = shipments.reduce(
      (sum, shipment) => sum + shipmentVolumeInCubicCentimeters(shipment),
      0,
    );

    const maxWeight = vehicle.compartments.reduce(
      (sum, compartment) => sum + toKilograms(compartment.capacity.maxWeight),
      0,
    );
    const maxVolume = vehicle.compartments.reduce(
      (sum, compartment) =>
        sum + toCubicCentimeters(compartment.capacity.maxVolume),
      0,
    );

    if (totalWeight > maxWeight) {
      throw new DomainException(
        "The total shipment weight exceeds the assigned vehicle capacity.",
      );
    }
    if (totalVolume > maxVolume) {
      throw new DomainException(
        "The total shipment volume exceeds the assigned vehicle capacity.",
      );
    }

    for (const shipment of shipments) {
      const dimensions = toCentimeters(shipment.dimensions);
      const fitsAnyCompartment = vehicle.compartments.some((compartment) => {
        const max = toCentimeters(compartment.capacity.maxItemDimensions);
        return (
          dimensions.length <= max.length &&
          dimensions.width <= max.width &&
          dimensions.height <= max.height
        );
      });
      if (!fitsAnyCompartment) {
        throw new DomainException(
          "A shipment does not fit within the assigned vehicle capacity.",
        );
      }
    }
  }
}

const GRAMS_PER_KILOGRAM = 1000;
const POUNDS_PER_KILOGRAM = 2.2046226218;
const MILLIMETERS_PER_CENTIMETER = 10;
const INCHES_PER_CENTIMETER = 0.3937007874;
const LITERS_PER_CUBIC_CENTIMETER = 0.001;
const CUBIC_FEET_PER_CUBIC_METER = 35.314666721;
const CUBIC_CENTIMETERS_PER_CUBIC_METER = 1_000_000;

function toKilograms(weight: {
  readonly value: number;
  readonly unit: WeightUnit;
}): number {
  switch (weight.unit) {
    case WeightUnit.Gram:
      return weight.value / GRAMS_PER_KILOGRAM;
    case WeightUnit.Pound:
      return weight.value / POUNDS_PER_KILOGRAM;
    default:
      return weight.value;
  }
}

function toCentimeters(dimensions: ShipmentLoad["dimensions"]): Dimensions {
  switch (dimensions.unit) {
    case DimensionUnit.Millimeter:
      return Dimensions.create({
        length: dimensions.length / MILLIMETERS_PER_CENTIMETER,
        width: dimensions.width / MILLIMETERS_PER_CENTIMETER,
        height: dimensions.height / MILLIMETERS_PER_CENTIMETER,
        unit: DimensionUnit.Centimeter,
      });
    case DimensionUnit.Inch:
      return Dimensions.create({
        length: dimensions.length / INCHES_PER_CENTIMETER,
        width: dimensions.width / INCHES_PER_CENTIMETER,
        height: dimensions.height / INCHES_PER_CENTIMETER,
        unit: DimensionUnit.Centimeter,
      });
    default:
      return Dimensions.create({
        ...dimensions,
        unit: DimensionUnit.Centimeter,
      });
  }
}

function shipmentVolumeInCubicCentimeters(shipment: ShipmentLoad): number {
  const dimensions = toCentimeters(shipment.dimensions);
  return dimensions.length * dimensions.width * dimensions.height;
}

function toCubicCentimeters(volume: {
  readonly value: number;
  readonly unit: VolumeUnit;
}): number {
  switch (volume.unit) {
    case VolumeUnit.Liter:
      return volume.value / LITERS_PER_CUBIC_CENTIMETER;
    case VolumeUnit.CubicMeter:
      return volume.value * CUBIC_CENTIMETERS_PER_CUBIC_METER;
    case VolumeUnit.CubicFoot:
      return (
        (volume.value / CUBIC_FEET_PER_CUBIC_METER) *
        CUBIC_CENTIMETERS_PER_CUBIC_METER
      );
  }
}
