import { Injectable } from "@nestjs/common";

import { DriverLicenseNumberConflictException } from "../../../app/driver.exceptions";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { PG_SQLSTATE } from "../../../../../../../shared/infra/persistence/pg-error";
import {
  execAndTranslatePgConstraintViolations,
  execRevisionedPgUpdate,
  type PgConstraintViolationTranslation,
} from "../../../../../../../shared/infra/persistence/pg-repository-write";
import { Driver } from "../../../domain/driver.aggregate";
import { DriverId } from "../../../domain/driver-id";
import {
  DriverRepository,
  type LoadedDriver,
} from "../../../domain/driver.repository";
import { DriverMapper } from "./mappers/driver.mapper";
import { findDriverByIdForUpdate } from "./queries/driver.find-by-id-for-update.queries";
import { findDriverById } from "./queries/driver.find-by-id.queries";
import { insertDriver } from "./queries/driver.insert.queries";
import { reconcileDriverCertifications } from "./queries/driver.reconcile-certifications.queries";
import { updateDriver } from "./queries/driver.update.queries";

const DRIVER_LICENSE_NUMBER_UNIQUE_CONSTRAINT =
  "drivers_tenant_license_number_unique";
const DRIVER_WRITE_CONSTRAINT_TRANSLATIONS = [
  {
    sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
    constraint: DRIVER_LICENSE_NUMBER_UNIQUE_CONSTRAINT,
    toError: (cause: unknown) =>
      new DriverLicenseNumberConflictException({ cause }),
  },
] satisfies readonly PgConstraintViolationTranslation[];

@Injectable()
export class PgDriverRepository extends DriverRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(tenantId: string, id: DriverId): Promise<LoadedDriver | null> {
    const [row] = await this.database.exec(findDriverById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: DriverMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  // For pessimistic concurrency (then trigger save() from app level after aggregate changes applied)
  async findByIdForUpdate(
    tenantId: string,
    id: DriverId,
  ): Promise<LoadedDriver | null> {
    const [row] = await this.database.exec(findDriverByIdForUpdate, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: DriverMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async add(tenantId: string, driver: Driver): Promise<void> {
    const persistence = DriverMapper.toPersistence(tenantId, driver);
    await execAndTranslatePgConstraintViolations({
      database: this.database,
      statement: insertDriver,
      params: persistence.root,
      options: { translations: DRIVER_WRITE_CONSTRAINT_TRANSLATIONS },
    });
    await this.database.exec(
      reconcileDriverCertifications,
      persistence.certifications,
    );
  }

  /**
   * Persists a loaded Driver using a revision-checked root update, then reconciles
   * its complete aggregate-owned certification collection in the app use-case transaction.
   *
   * All certification writes must go through the Driver aggregate and this root
   * save path. Full-state reconciliation is suitable for a small, bounded child
   * collection like this one. Split large collections into separate aggregates.
   */
  async save(tenantId: string, loadedDriver: LoadedDriver): Promise<string> {
    const persistence = DriverMapper.toPersistence(
      tenantId,
      loadedDriver.aggregate,
    );
    const revision = await execRevisionedPgUpdate({
      database: this.database,
      statement: updateDriver,
      params: {
        ...persistence.root,
        expectedRevision: loadedDriver.expectedRevision,
      },
      options: {
        aggregateName: "Driver",
        constraintTranslations: DRIVER_WRITE_CONSTRAINT_TRANSLATIONS,
      },
    });
    await this.database.exec(
      reconcileDriverCertifications,
      persistence.certifications,
    );
    return revision;
  }
}
