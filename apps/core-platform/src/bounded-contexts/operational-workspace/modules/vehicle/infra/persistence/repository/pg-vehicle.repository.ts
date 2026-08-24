import { Injectable } from "@nestjs/common";

import { VehicleRegistrationNumberConflictException } from "../../../app/vehicle.exceptions.js";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { PG_SQLSTATE } from "../../../../../../../shared/infra/persistence/pg-error.js";
import {
  execAndTranslatePgConstraintViolations,
  execRevisionedPgUpdate,
  type PgConstraintViolationTranslation,
} from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import { Vehicle, VehicleStatus } from "../../../domain/vehicle.aggregate.js";
import { VehicleId } from "../../../domain/vehicle-id.js";
import {
  VehicleRepository,
  type LoadedVehicle,
} from "../../../domain/vehicle.repository.js";
import { VehicleMapper } from "./mappers/vehicle.mapper.js";
import { findAvailableVehicles } from "./queries/vehicle.find-available.queries.js";
import { findVehicleById } from "./queries/vehicle.find-by-id.queries.js";
import { insertVehicle } from "./queries/vehicle.insert.queries.js";
import { reconcileVehicleCompartments } from "./queries/vehicle.reconcile-compartments.queries.js";
import { updateVehicle } from "./queries/vehicle.update.queries.js";

const VEHICLE_REGISTRATION_NUMBER_UNIQUE_CONSTRAINT =
  "vehicles_tenant_registration_number_unique";
const VEHICLE_WRITE_CONSTRAINT_TRANSLATIONS = [
  {
    sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
    constraint: VEHICLE_REGISTRATION_NUMBER_UNIQUE_CONSTRAINT,
    toError: (cause: unknown) =>
      new VehicleRegistrationNumberConflictException({ cause }),
  },
] satisfies readonly PgConstraintViolationTranslation[];

@Injectable()
export class PgVehicleRepository extends VehicleRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: VehicleId,
  ): Promise<LoadedVehicle | null> {
    const [row] = await this.database.exec(findVehicleById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: VehicleMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async findAvailable(tenantId: string): Promise<readonly Vehicle[]> {
    const rows = await this.database.exec(findAvailableVehicles, {
      tenantId,
      status: VehicleStatus.Available,
    });
    return rows.map((row) => VehicleMapper.toDomain(row));
  }

  async add(tenantId: string, vehicle: Vehicle): Promise<void> {
    const persistence = VehicleMapper.toPersistence(tenantId, vehicle);
    await execAndTranslatePgConstraintViolations({
      database: this.database,
      statement: insertVehicle,
      params: persistence.root,
      options: { translations: VEHICLE_WRITE_CONSTRAINT_TRANSLATIONS },
    });
    await this.database.exec(
      reconcileVehicleCompartments,
      persistence.compartments,
    );
  }

  async save(tenantId: string, loadedVehicle: LoadedVehicle): Promise<string> {
    const persistence = VehicleMapper.toPersistence(
      tenantId,
      loadedVehicle.aggregate,
    );
    const revision = await execRevisionedPgUpdate({
      database: this.database,
      statement: updateVehicle,
      params: {
        ...persistence.root,
        expectedRevision: loadedVehicle.expectedRevision,
      },
      options: {
        aggregateName: "Vehicle",
        constraintTranslations: VEHICLE_WRITE_CONSTRAINT_TRANSLATIONS,
      },
    });
    await this.database.exec(
      reconcileVehicleCompartments,
      persistence.compartments,
    );
    return revision;
  }
}
