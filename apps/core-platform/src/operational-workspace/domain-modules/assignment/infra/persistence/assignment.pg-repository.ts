import { Injectable } from "@nestjs/common";

import {
  persistChildChanges,
  persistRoot,
} from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Assignment } from "../../domain/assignment.aggregate";
import { AssignmentId } from "../../domain/assignment-id";
import { AssignmentRepository } from "../../domain/assignment.repository";
import type { DriverId } from "../../../driver/domain/driver-id";
import type { RouteId } from "../../../route/domain/route-id";
import type { VehicleId } from "../../../vehicle/domain/vehicle-id";
import { deleteAssignment } from "./queries/assignment.delete.queries";
import { deleteAssignmentShipments } from "./queries/assignment.delete-shipments.queries";
import { findAssignmentById } from "./queries/assignment.find-by-id.queries";
import { findAssignmentsByIds } from "./queries/assignment.find-by-ids.queries";
import { existsActiveAssignmentForRoute } from "./queries/assignment.exists-active-for-route.queries";
import { existsActiveAssignmentForVehicle } from "./queries/assignment.exists-active-for-vehicle.queries";
import { existsActiveAssignmentForDriver } from "./queries/assignment.exists-active-for-driver.queries";
import { existsRunningAssignmentForRoute } from "./queries/assignment.exists-running-for-route.queries";
import { insertAssignment } from "./queries/assignment.insert.queries";
import { insertAssignmentShipments } from "./queries/assignment.insert-shipments.queries";
import { updateAssignment } from "./queries/assignment.update.queries";
import { AssignmentMapper } from "./assignment.mapper";
import type { AssignmentEntity } from "./entities/assignment.entity";

@Injectable()
export class PgAssignmentRepository extends AssignmentRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(id: AssignmentId): Promise<Assignment | null> {
    const [row] = await this.database.exec(findAssignmentById, {
      id: id.value,
    });
    return row
      ? AssignmentMapper.toDomain(row as unknown as AssignmentEntity)
      : null;
  }

  async findByIds(
    ids: readonly AssignmentId[],
  ): Promise<readonly Assignment[]> {
    if (ids.length === 0) return [];
    const rows = await this.database.exec(findAssignmentsByIds, {
      ids: ids.map((id) => id.value),
    });
    return rows.map((row) =>
      AssignmentMapper.toDomain(row as unknown as AssignmentEntity),
    );
  }

  async existsActiveForRoute(routeId: RouteId): Promise<boolean> {
    const [result] = await this.database.exec(existsActiveAssignmentForRoute, {
      routeId: routeId.value,
    });
    return result.exists;
  }

  async existsRunningForRoute(routeId: RouteId): Promise<boolean> {
    const [result] = await this.database.exec(existsRunningAssignmentForRoute, {
      routeId: routeId.value,
    });
    return result.exists;
  }

  async existsActiveForVehicle(vehicleId: VehicleId): Promise<boolean> {
    const [result] = await this.database.exec(existsActiveAssignmentForVehicle, {
      vehicleId: vehicleId.value,
    });
    return result.exists;
  }

  async existsActiveForDriver(driverId: DriverId): Promise<boolean> {
    const [result] = await this.database.exec(existsActiveAssignmentForDriver, {
      driverId: driverId.value,
    });
    return result.exists;
  }

  async save(assignment: Assignment): Promise<void> {
    const persistence = AssignmentMapper.toPersistence(assignment);

    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertAssignment,
      updateStatement: updateAssignment,
      params: persistence.root,
    });

    await persistChildChanges(this.database, {
      inserts: persistence.shipmentInserts,
      updates: [],
      removedIds: persistence.removedShipmentIds,
      insertStatement: insertAssignmentShipments,
      deleteStatement: deleteAssignmentShipments,
    });
  }

  async delete(id: AssignmentId): Promise<void> {
    await this.database.exec(deleteAssignment, { id: id.value });
  }
}
