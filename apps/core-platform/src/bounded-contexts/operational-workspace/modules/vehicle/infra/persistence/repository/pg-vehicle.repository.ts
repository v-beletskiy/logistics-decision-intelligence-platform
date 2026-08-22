import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { Vehicle, VehicleStatus } from "../../../domain/vehicle.aggregate";
import { VehicleId } from "../../../domain/vehicle-id";
import {
  VehicleRepository,
  type LoadedVehicle,
} from "../../../domain/vehicle.repository";
import { VehicleMapper } from "./mappers/vehicle.mapper";
import { findAvailableVehicles } from "./queries/vehicle.find-available.queries";
import { findVehicleById } from "./queries/vehicle.find-by-id.queries";
import { insertVehicle } from "./queries/vehicle.insert.queries";
import { reconcileVehicleCompartments } from "./queries/vehicle.reconcile-compartments.queries";
import { updateVehicle } from "./queries/vehicle.update.queries";

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
    await this.database.exec(insertVehicle, persistence.root);
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
    const [row] = await this.database.exec(updateVehicle, {
      ...persistence.root,
      expectedRevision: loadedVehicle.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Vehicle was changed or removed by another operation.",
      );
    }
    await this.database.exec(
      reconcileVehicleCompartments,
      persistence.compartments,
    );
    return row.revision;
  }
}
