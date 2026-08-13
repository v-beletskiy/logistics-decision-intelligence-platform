import type { Assignment } from "./assignment.aggregate";
import type { AssignmentId } from "./assignment-id";
import type { DriverId } from "../../driver/domain/driver-id";
import type { RouteId } from "../../route/domain/route-id";
import type { VehicleId } from "../../vehicle/domain/vehicle-id";

export abstract class AssignmentRepository {
  abstract findById(tenantId: string, id: AssignmentId): Promise<Assignment | null>;
  abstract findByIds(
    tenantId: string,
    ids: readonly AssignmentId[],
  ): Promise<readonly Assignment[]>;
  abstract existsActiveForRoute(tenantId: string, routeId: RouteId): Promise<boolean>;
  abstract existsRunningForRoute(tenantId: string, routeId: RouteId): Promise<boolean>;
  abstract existsActiveForVehicle(tenantId: string, vehicleId: VehicleId): Promise<boolean>;
  abstract existsActiveForDriver(tenantId: string, driverId: DriverId): Promise<boolean>;
  abstract save(tenantId: string, assignment: Assignment): Promise<void>;
  abstract delete(tenantId: string, id: AssignmentId): Promise<void>;
}
