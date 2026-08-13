import type { Vehicle } from "./vehicle.aggregate";
import type { VehicleId } from "./vehicle-id";

export abstract class VehicleRepository {
  abstract findById(tenantId: string, id: VehicleId): Promise<Vehicle | null>;
  abstract findAvailable(tenantId: string): Promise<readonly Vehicle[]>;
  abstract save(tenantId: string, vehicle: Vehicle): Promise<void>;
  abstract delete(tenantId: string, id: VehicleId): Promise<void>;
}
