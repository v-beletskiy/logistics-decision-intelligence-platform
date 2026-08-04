import { Injectable } from "@nestjs/common";

import { persistRoot } from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Driver, DriverStatus } from "../../domain/driver.aggregate";
import { DriverId } from "../../domain/driver-id";
import { DriverRepository } from "../../domain/driver.repository";
import { deleteDriver } from "./queries/driver.delete.queries";
import { findAvailableDrivers } from "./queries/driver.find-available.queries";
import { findDriverById } from "./queries/driver.find-by-id.queries";
import { insertDriver } from "./queries/driver.insert.queries";
import { updateDriver } from "./queries/driver.update.queries";
import { DriverMapper } from "./driver.mapper";
import type { DriverEntity } from "./entities/driver.entity";

@Injectable()
export class PgDriverRepository extends DriverRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(id: DriverId): Promise<Driver | null> {
    const [row] = await this.database.exec(findDriverById, { id: id.value });
    return row ? DriverMapper.toDomain(row as unknown as DriverEntity) : null;
  }

  async findAvailable(): Promise<readonly Driver[]> {
    const rows = await this.database.exec(findAvailableDrivers, {
      status: DriverStatus.Available,
    });
    return rows.map((row) =>
      DriverMapper.toDomain(row as unknown as DriverEntity),
    );
  }

  async save(driver: Driver): Promise<void> {
    const persistence = DriverMapper.toPersistence(driver);
    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertDriver,
      updateStatement: updateDriver,
      params: persistence.root,
    });
  }

  async delete(id: DriverId): Promise<void> {
    await this.database.exec(deleteDriver, { id: id.value });
  }
}
