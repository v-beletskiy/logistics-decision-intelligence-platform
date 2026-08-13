import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../shared/app/exceptions/concurrency-conflict.exception";
import { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
import { Assignment } from "../../../domain/assignment.aggregate";
import { AssignmentId } from "../../../domain/assignment-id";
import {
  AssignmentRepository,
  type LoadedAssignment,
} from "../../../domain/assignment.repository";
import { DriverId } from "../../../../driver/domain/driver-id";
import { RouteId } from "../../../../route/domain/route-id";
import { VehicleId } from "../../../../vehicle/domain/vehicle-id";
import { AssignmentMapper } from "./mappers/assignment.mapper";
import { existsActiveAssignmentForDriver } from "./queries/assignment.exists-active-for-driver.queries";
import { existsActiveAssignmentForRoute } from "./queries/assignment.exists-active-for-route.queries";
import { existsActiveAssignmentForVehicle } from "./queries/assignment.exists-active-for-vehicle.queries";
import { existsRunningAssignmentForRoute } from "./queries/assignment.exists-running-for-route.queries";
import { findAssignmentById } from "./queries/assignment.find-by-id.queries";
import { findAssignmentsByIds } from "./queries/assignment.find-by-ids.queries";
import { insertAssignment } from "./queries/assignment.insert.queries";
import { reconcileAssignmentShipments } from "./queries/assignment.reconcile-shipments.queries";
import { updateAssignment } from "./queries/assignment.update.queries";

@Injectable()
export class PgAssignmentRepository extends AssignmentRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: AssignmentId,
  ): Promise<LoadedAssignment | null> {
    const [row] = await this.database.exec(findAssignmentById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: AssignmentMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async findByIds(
    tenantId: string,
    ids: readonly AssignmentId[],
  ): Promise<readonly Assignment[]> {
    if (ids.length === 0) return [];
    const rows = await this.database.exec(findAssignmentsByIds, {
      tenantId,
      ids: ids.map((id) => id.value),
    });
    return rows.map((row) => AssignmentMapper.toDomain(row));
  }

  async existsActiveForRoute(
    tenantId: string,
    routeId: RouteId,
  ): Promise<boolean> {
    const [row] = await this.database.exec(existsActiveAssignmentForRoute, {
      tenantId,
      routeId: routeId.value,
    });
    return row?.exists ?? false;
  }

  async existsRunningForRoute(
    tenantId: string,
    routeId: RouteId,
  ): Promise<boolean> {
    const [row] = await this.database.exec(existsRunningAssignmentForRoute, {
      tenantId,
      routeId: routeId.value,
    });
    return row?.exists ?? false;
  }

  async existsActiveForVehicle(
    tenantId: string,
    vehicleId: VehicleId,
  ): Promise<boolean> {
    const [row] = await this.database.exec(existsActiveAssignmentForVehicle, {
      tenantId,
      vehicleId: vehicleId.value,
    });
    return row?.exists ?? false;
  }

  async existsActiveForDriver(
    tenantId: string,
    driverId: DriverId,
  ): Promise<boolean> {
    const [row] = await this.database.exec(existsActiveAssignmentForDriver, {
      tenantId,
      driverId: driverId.value,
    });
    return row?.exists ?? false;
  }

  async add(tenantId: string, assignment: Assignment): Promise<void> {
    const persistence = AssignmentMapper.toPersistence(tenantId, assignment);
    await this.database.exec(insertAssignment, persistence.root);
    await this.database.exec(
      reconcileAssignmentShipments,
      persistence.shipments,
    );
  }

  async save(
    tenantId: string,
    loadedAssignment: LoadedAssignment,
  ): Promise<string> {
    const persistence = AssignmentMapper.toPersistence(
      tenantId,
      loadedAssignment.aggregate,
    );
    const [row] = await this.database.exec(updateAssignment, {
      ...persistence.root,
      expectedRevision: loadedAssignment.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Assignment was changed or removed by another operation.",
      );
    }
    await this.database.exec(
      reconcileAssignmentShipments,
      persistence.shipments,
    );
    return row.revision;
  }
}
