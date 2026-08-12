import type { Driver } from "./driver.aggregate";
import type { DriverId } from "./driver-id";

export interface LoadedDriver {
  readonly aggregate: Driver;
  readonly expectedRevision: number;
}

export abstract class DriverRepository {
  abstract findById(
    tenantId: string,
    id: DriverId,
  ): Promise<LoadedDriver | null>;
  abstract findByIdForUpdate(
    tenantId: string,
    id: DriverId,
  ): Promise<LoadedDriver | null>;
  abstract add(tenantId: string, driver: Driver): Promise<void>;
  abstract save(tenantId: string, loadedDriver: LoadedDriver): Promise<number>;
}
