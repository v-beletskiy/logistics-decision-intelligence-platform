import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions.js";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { PG_SQLSTATE } from "../../../../../../../shared/infra/persistence/pg-error.js";
import {
  execAndTranslatePgConstraintViolations,
  execRevisionedPgUpdate,
  type PgConstraintViolationTranslation,
} from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import { Assignment } from "../../../domain/assignment.aggregate.js";
import { AssignmentId } from "../../../domain/assignment-id.js";
import {
  AssignmentRepository,
  type LoadedAssignment,
} from "../../../domain/assignment.repository.js";
import { DriverId } from "../../../../driver/domain/driver-id.js";
import { RouteId } from "../../../../route/domain/route-id.js";
import { VehicleId } from "../../../../vehicle/domain/vehicle-id.js";
import { AssignmentMapper } from "./mappers/assignment.mapper.js";
import { existsActiveAssignmentForDriver } from "./queries/assignment.exists-active-for-driver.queries.js";
import { existsActiveAssignmentForRoute } from "./queries/assignment.exists-active-for-route.queries.js";
import { existsActiveAssignmentForVehicle } from "./queries/assignment.exists-active-for-vehicle.queries.js";
import { existsRunningAssignmentForRoute } from "./queries/assignment.exists-running-for-route.queries.js";
import { findAssignmentById } from "./queries/assignment.find-by-id.queries.js";
import { findAssignmentsByIds } from "./queries/assignment.find-by-ids.queries.js";
import { insertAssignment } from "./queries/assignment.insert.queries.js";
import { reconcileAssignmentShipments } from "./queries/assignment.reconcile-shipments.queries.js";
import { updateAssignment } from "./queries/assignment.update.queries.js";

const ACTIVE_ASSIGNMENT_UNIQUE_CONSTRAINTS = [
  "assignments_tenant_active_vehicle_unique",
  "assignments_tenant_active_driver_unique",
  "assignments_tenant_active_route_unique",
] as const;
const ASSIGNMENT_WRITE_CONSTRAINT_TRANSLATIONS =
  ACTIVE_ASSIGNMENT_UNIQUE_CONSTRAINTS.map(
    (constraint): PgConstraintViolationTranslation => ({
      sqlState: PG_SQLSTATE.UNIQUE_VIOLATION,
      constraint,
      toError: () =>
        new ConcurrencyConflictException(
          "An active Assignment was created or changed concurrently for this Route, Vehicle, or Driver.",
        ),
    }),
  );

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
    await execAndTranslatePgConstraintViolations({
      database: this.database,
      statement: insertAssignment,
      params: persistence.root,
      options: { translations: ASSIGNMENT_WRITE_CONSTRAINT_TRANSLATIONS },
    });
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
    const revision = await execRevisionedPgUpdate({
      database: this.database,
      statement: updateAssignment,
      params: {
        ...persistence.root,
        expectedRevision: loadedAssignment.expectedRevision,
      },
      options: {
        aggregateName: "Assignment",
        constraintTranslations: ASSIGNMENT_WRITE_CONSTRAINT_TRANSLATIONS,
      },
    });
    await this.database.exec(
      reconcileAssignmentShipments,
      persistence.shipments,
    );
    return revision;
  }
}
