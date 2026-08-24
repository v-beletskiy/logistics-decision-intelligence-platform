import type { Assignment } from "./assignment.aggregate.js";
import type { AssignmentId } from "./assignment-id.js";
import type { DriverId } from "../../driver/domain/driver-id.js";
import type { RouteId } from "../../route/domain/route-id.js";
import type { VehicleId } from "../../vehicle/domain/vehicle-id.js";

export interface LoadedAssignment {
  readonly aggregate: Assignment;
  readonly expectedRevision: string;
}

export abstract class AssignmentRepository {
  abstract findById(
    tenantId: string,
    id: AssignmentId,
  ): Promise<LoadedAssignment | null>;
  abstract findByIds(
    tenantId: string,
    ids: readonly AssignmentId[],
  ): Promise<readonly Assignment[]>;
  abstract existsActiveForRoute(
    tenantId: string,
    routeId: RouteId,
  ): Promise<boolean>;
  abstract existsRunningForRoute(
    tenantId: string,
    routeId: RouteId,
  ): Promise<boolean>;
  abstract existsActiveForVehicle(
    tenantId: string,
    vehicleId: VehicleId,
  ): Promise<boolean>;
  abstract existsActiveForDriver(
    tenantId: string,
    driverId: DriverId,
  ): Promise<boolean>;
  abstract add(tenantId: string, assignment: Assignment): Promise<void>;
  abstract save(
    tenantId: string,
    loadedAssignment: LoadedAssignment,
  ): Promise<string>;
}
