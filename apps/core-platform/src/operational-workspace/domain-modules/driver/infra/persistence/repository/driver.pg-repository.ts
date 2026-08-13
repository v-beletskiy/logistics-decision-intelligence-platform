import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../shared/app/exceptions/concurrency-conflict.exception";
import { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
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
import {
  reconcileDriverCertifications,
  type IReconcileDriverCertificationsParams,
} from "./queries/driver.reconcile-certifications.queries";
import { updateDriver } from "./queries/driver.update.queries";

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
    await this.database.exec(insertDriver, persistence.root);
    await this.reconcileCertifications(persistence.certifications);
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
    const [row] = await this.database.exec(updateDriver, {
      ...persistence.root,
      expectedRevision: loadedDriver.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Driver was changed or removed by another operation.",
      );
    }
    await this.reconcileCertifications(persistence.certifications);
    return row.revision;
  }

  //
  // missing certifications - insert;
  // existing certifications - update or do nothing if they're the same
  // deleted certifications - delete
  private async reconcileCertifications(
    params: IReconcileDriverCertificationsParams,
  ): Promise<void> {
    await this.database.exec(reconcileDriverCertifications, params);
  }
}
