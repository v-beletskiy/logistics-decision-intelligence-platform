import {
  Driver,
  DriverStatus,
  type DriverProps,
} from "../../domain/driver.aggregate";
import { DriverId } from "../../domain/driver-id";
import { AggregatePersistenceMapper } from "../../../../../shared/infra/persistence/orm/aggregate-mapper";
import type { DriverEntity } from "./entities/driver.entity";
import type { IInsertDriverParams } from "./queries/driver.insert.queries";

/** Root row consumed by persistRoot, matching the driver insert/update statements. */
export type DriverRootRow = IInsertDriverParams;

/** Write rows derived from the aggregate's persistence plan. */
export interface DriverWriteModel {
  readonly isNew: boolean;
  readonly root: DriverRootRow;
}

/**
 * Explicit persistence-to-domain and domain-to-persistence mapping for Driver.
 *
 * Reads trust the persisted shape; business rules are validated by the domain
 * constructors. Writes derive their rows from the aggregate's persistence plan.
 */
export class DriverMapper extends AggregatePersistenceMapper {
  static toDomain(row: DriverEntity): Driver {
    const props: DriverProps = {
      firstName: row.first_name,
      lastName: row.last_name,
      licenseNumber: row.license_number,
      depotId: row.depot_id ?? undefined,
      phoneNumber: row.phone_number ?? undefined,
      status: row.status as DriverStatus,
    };
    return Driver.reconstitute(DriverId.from(row.id), props);
  }

  static toPersistence(driver: Driver): DriverWriteModel {
    const plan = driver.getPersistencePlan();
    return {
      isNew: plan.isNew,
      root: {
        id: driver.id.value,
        firstName: driver.firstName,
        lastName: driver.lastName,
        licenseNumber: driver.licenseNumber,
        depotId: driver.depotId,
        phoneNumber: driver.phoneNumber,
        status: driver.status,
      },
    };
  }
}
