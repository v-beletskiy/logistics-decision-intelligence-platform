import type { Vehicle } from "./vehicle.aggregate";
import type { VehicleId } from "./vehicle-id";

export interface LoadedVehicle {
  readonly aggregate: Vehicle;
  readonly expectedRevision: string;
}

export abstract class VehicleRepository {
  abstract findById(
    tenantId: string,
    id: VehicleId,
  ): Promise<LoadedVehicle | null>;
  abstract findAvailable(tenantId: string): Promise<readonly Vehicle[]>;
  abstract add(tenantId: string, vehicle: Vehicle): Promise<void>;
  abstract save(
    tenantId: string,
    loadedVehicle: LoadedVehicle,
  ): Promise<string>;
}
