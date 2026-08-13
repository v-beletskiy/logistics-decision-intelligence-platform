import { DomainException } from "../../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import {
  type Dimensions,
  VolumeUnit,
  type Weight,
  WeightUnit,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";

import type { Driver } from "../../../driver/domain/driver.aggregate";
import { DriverStatus } from "../../../driver/domain/driver.aggregate";
import type { Route } from "../../../route/domain/route.aggregate";
import { RouteStatus } from "../../../route/domain/route.aggregate";
import type { Vehicle } from "../../../vehicle/domain/vehicle.aggregate";
import { VehicleStatus } from "../../../vehicle/domain/vehicle.aggregate";

export interface ShipmentLoad {
  readonly weight: Weight;
  readonly dimensions: Dimensions;
}

export interface AssignmentPlanningContext {
  readonly vehicleHasActiveAssignment: boolean;
  readonly driverHasActiveAssignment: boolean;
  readonly routeHasActiveAssignment: boolean;
}

/**
 * Cross-aggregate eligibility rules for assignment planning.
 *
 * This policy is deliberately side-effect free. Aggregate state changes remain
 * owned by Assignment after the application layer has obtained policy approval.
 */
export class AssignmentPlanningPolicy {
  assertCanCreateAssignment(
    route: Route,
    vehicle: Vehicle,
    driver: Driver,
    shipmentsLoad: readonly ShipmentLoad[],
    context: AssignmentPlanningContext,
  ): void {
    this.assertRouteCanBeAssigned(route, context.routeHasActiveAssignment);
    this.assertVehicleCanBeAssigned(
      vehicle,
      shipmentsLoad,
      context.vehicleHasActiveAssignment,
    );
    this.assertDriverCanBeAssigned(driver, context.driverHasActiveAssignment);
  }

  assertVehicleCanBeAssigned(
    vehicle: Vehicle,
    shipmentsLoad: readonly ShipmentLoad[],
    hasActiveAssignment: boolean,
  ): void {
    if (vehicle.status !== VehicleStatus.Available) {
      throw new DomainException("An unavailable vehicle cannot be assigned.");
    }
    if (hasActiveAssignment) {
      throw new DomainException(
        "A vehicle cannot participate in multiple active assignments simultaneously.",
      );
    }
    this.assertCapacityFits(vehicle, shipmentsLoad);
  }

  assertDriverCanBeAssigned(
    driver: Driver,
    hasActiveAssignment: boolean,
  ): void {
    if (driver.status === DriverStatus.Suspended) {
      throw new DomainException("A suspended driver cannot be assigned.");
    }
    if (hasActiveAssignment) {
      throw new DomainException(
        "A driver cannot participate in multiple active assignments simultaneously.",
      );
    }
  }

  private assertRouteCanBeAssigned(
    route: Route,
    hasActiveAssignment: boolean,
  ): void {
    if (hasActiveAssignment) {
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
    shipmentsLoad: readonly ShipmentLoad[],
  ): void {
    if (shipmentsLoad.length === 0) {
      throw new DomainException(
        "An assignment must contain at least one shipment.",
      );
    }

    let totalWeightInKilograms = 0;
    let totalVolumeInCubicMeters = 0;
    for (const shipment of shipmentsLoad) {
      totalWeightInKilograms += shipment.weight.valueIn(WeightUnit.Kilogram);
      totalVolumeInCubicMeters += shipment.dimensions
        .volume()
        .valueIn(VolumeUnit.CubicMeter);
    }

    let maxWeightInKilograms = 0;
    let maxVolumeInCubicMeters = 0;
    const compartments = vehicle.compartments;
    for (const compartment of compartments) {
      maxWeightInKilograms += compartment.capacity.maxWeight.valueIn(
        WeightUnit.Kilogram,
      );
      maxVolumeInCubicMeters += compartment.capacity.maxVolume.valueIn(
        VolumeUnit.CubicMeter,
      );
    }

    if (totalWeightInKilograms > maxWeightInKilograms) {
      throw new DomainException(
        "The total shipment weight exceeds the assigned vehicle capacity.",
      );
    }
    if (totalVolumeInCubicMeters > maxVolumeInCubicMeters) {
      throw new DomainException(
        "The total shipment volume exceeds the assigned vehicle capacity.",
      );
    }

    for (const shipment of shipmentsLoad) {
      const fitsAnyCompartment = compartments.some((compartment) =>
        shipment.dimensions.isWithinEnvelope(
          compartment.capacity.maxItemDimensions,
        ),
      );
      if (!fitsAnyCompartment) {
        throw new DomainException(
          "A shipment does not fit within the assigned vehicle capacity.",
        );
      }
    }
  }
}
