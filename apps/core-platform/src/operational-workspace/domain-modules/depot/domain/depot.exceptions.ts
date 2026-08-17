import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";

export class DepotVehicleCapacityExceededException extends DomainException {
  constructor(vehicleCount: number, vehicleCapacity: number) {
    super(
      "Depot vehicle occupancy cannot exceed its vehicle capacity.",
      "depot.vehicle-capacity-exceeded",
      { vehicleCount, vehicleCapacity },
    );
  }
}

export class DepotDriverCapacityExceededException extends DomainException {
  constructor(driverCount: number, driverCapacity: number) {
    super(
      "Depot driver occupancy cannot exceed its driver capacity.",
      "depot.driver-capacity-exceeded",
      { driverCount, driverCapacity },
    );
  }
}
