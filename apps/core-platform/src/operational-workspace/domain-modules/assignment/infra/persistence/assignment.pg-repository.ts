import { Injectable } from "@nestjs/common";

import {
  persistChildChanges,
  persistRoot,
} from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Assignment } from "../../domain/assignment.aggregate";
import { AssignmentId } from "../../domain/assignment-id";
import { AssignmentRepository } from "../../domain/assignment.repository";
import { deleteAssignment } from "./queries/assignment.delete.queries";
import { deleteAssignmentShipments } from "./queries/assignment.delete-shipments.queries";
import { findAssignmentById } from "./queries/assignment.find-by-id.queries";
import { findAssignmentsByIds } from "./queries/assignment.find-by-ids.queries";
import { findActiveAssignmentByRouteId } from "./queries/assignment.find-active-by-route-id.queries";
import { findActiveAssignmentByVehicleId } from "./queries/assignment.find-active-by-vehicle-id.queries";
import { findActiveAssignmentByDriverId } from "./queries/assignment.find-active-by-driver-id.queries";
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

  async findByIds(ids: readonly string[]): Promise<readonly Assignment[]> {
    if (ids.length === 0) return [];
    const rows = await this.database.exec(findAssignmentsByIds, {
      ids: [...ids],
    });
    return rows.map((row) =>
      AssignmentMapper.toDomain(row as unknown as AssignmentEntity),
    );
  }

  async findActiveByRouteId(routeId: string): Promise<Assignment | null> {
    const [row] = await this.database.exec(findActiveAssignmentByRouteId, {
      routeId,
    });
    return row
      ? AssignmentMapper.toDomain(row as unknown as AssignmentEntity)
      : null;
  }

  async findActiveByVehicleId(vehicleId: string): Promise<Assignment | null> {
    const [row] = await this.database.exec(findActiveAssignmentByVehicleId, {
      vehicleId,
    });
    return row
      ? AssignmentMapper.toDomain(row as unknown as AssignmentEntity)
      : null;
  }

  async findActiveByDriverId(driverId: string): Promise<Assignment | null> {
    const [row] = await this.database.exec(findActiveAssignmentByDriverId, {
      driverId,
    });
    return row
      ? AssignmentMapper.toDomain(row as unknown as AssignmentEntity)
      : null;
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
