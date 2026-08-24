import type { Driver } from "./driver.aggregate.js";
import type { DriverId } from "./driver-id.js";

export interface LoadedDriver {
  readonly aggregate: Driver;
  readonly expectedRevision: string;
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
  abstract save(tenantId: string, loadedDriver: LoadedDriver): Promise<string>;
}
