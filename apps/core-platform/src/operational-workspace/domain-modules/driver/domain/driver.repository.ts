import type { Driver } from "./driver.aggregate";
import type { DriverId } from "./driver-id";

export abstract class DriverRepository {
  abstract findById(id: DriverId): Promise<Driver | null>;
  abstract findAvailable(): Promise<readonly Driver[]>;
  abstract save(driver: Driver): Promise<void>;
  abstract delete(id: DriverId): Promise<void>;
}
