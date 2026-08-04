import { Injectable } from "@nestjs/common";

import {
  persistRoot,
  persistChildChanges,
} from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Vehicle, VehicleStatus } from "../../domain/vehicle.aggregate";
import { VehicleId } from "../../domain/vehicle-id";
import { VehicleRepository } from "../../domain/vehicle.repository";
import { deleteVehicleCompartments } from "./queries/vehicle.delete-compartments.queries";
import { deleteVehicle } from "./queries/vehicle.delete.queries";
import { findAvailableVehicles } from "./queries/vehicle.find-available.queries";
import { findVehicleById } from "./queries/vehicle.find-by-id.queries";
import { insertVehicleCompartments } from "./queries/vehicle.insert-compartments.queries";
import { insertVehicle } from "./queries/vehicle.insert.queries";
import { updateVehicleCompartments } from "./queries/vehicle.update-compartments.queries";
import { updateVehicle } from "./queries/vehicle.update.queries";
import { VehicleMapper } from "./vehicle.mapper";
import type { VehicleEntity } from "./entities/vehicle.entity";

@Injectable()
export class PgVehicleRepository extends VehicleRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(id: VehicleId): Promise<Vehicle | null> {
    const [vehicle] = await this.database.exec(findVehicleById, {
      id: id.value,
    });
    if (!vehicle) return null;
    return VehicleMapper.toDomain(vehicle as unknown as VehicleEntity);
  }

  async findAvailable(): Promise<readonly Vehicle[]> {
    const vehicles = await this.database.exec(findAvailableVehicles, {
      status: VehicleStatus.Available,
    });
    return vehicles.map((vehicle) =>
      VehicleMapper.toDomain(vehicle as unknown as VehicleEntity),
    );
  }

  async save(vehicle: Vehicle): Promise<void> {
    const persistence = VehicleMapper.toPersistence(vehicle);

    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertVehicle,
      updateStatement: updateVehicle,
      params: persistence.root,
    });

    await persistChildChanges(this.database, {
      inserts: persistence.inserts,
      updates: persistence.updates,
      removedIds: persistence.removedIds,
      insertStatement: insertVehicleCompartments,
      updateStatement: updateVehicleCompartments,
      deleteStatement: deleteVehicleCompartments,
    });
  }

  async delete(id: VehicleId): Promise<void> {
    await this.database.exec(deleteVehicle, { id: id.value });
  }
}
