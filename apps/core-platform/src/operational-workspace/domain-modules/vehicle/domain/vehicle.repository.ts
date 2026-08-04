import type { Vehicle } from "./vehicle.aggregate";
import type { VehicleId } from "./vehicle-id";

export abstract class VehicleRepository {
  abstract findById(id: VehicleId): Promise<Vehicle | null>;
  abstract findAvailable(): Promise<readonly Vehicle[]>;
  abstract save(vehicle: Vehicle): Promise<void>;
  abstract delete(id: VehicleId): Promise<void>;
}
