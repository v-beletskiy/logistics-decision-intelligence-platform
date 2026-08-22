import { DomainException } from "../../../../../shared/domain/domain.exceptions";
import { DEPOT_ERROR_CODES } from "./depot-error-codes";

export class DepotVehicleCapacityExceededException extends DomainException {
  constructor(vehicleCount: number, vehicleCapacity: number) {
    super(
      "Depot vehicle occupancy cannot exceed its vehicle capacity.",
      DEPOT_ERROR_CODES.vehicleCapacityExceeded,
      { vehicleCount, vehicleCapacity },
    );
  }
}

export class DepotDriverCapacityExceededException extends DomainException {
  constructor(driverCount: number, driverCapacity: number) {
    super(
      "Depot driver occupancy cannot exceed its driver capacity.",
      DEPOT_ERROR_CODES.driverCapacityExceeded,
      { driverCount, driverCapacity },
    );
  }
}
