import type { Assignment } from "./assignment.aggregate";
import type { AssignmentId } from "./assignment-id";
import type { DriverId } from "../../driver/domain/driver-id";
import type { RouteId } from "../../route/domain/route-id";
import type { VehicleId } from "../../vehicle/domain/vehicle-id";

export abstract class AssignmentRepository {
  abstract findById(id: AssignmentId): Promise<Assignment | null>;
  abstract findByIds(ids: readonly AssignmentId[]): Promise<readonly Assignment[]>;
  abstract existsActiveForRoute(routeId: RouteId): Promise<boolean>;
  abstract existsRunningForRoute(routeId: RouteId): Promise<boolean>;
  abstract existsActiveForVehicle(vehicleId: VehicleId): Promise<boolean>;
  abstract existsActiveForDriver(driverId: DriverId): Promise<boolean>;
  abstract save(assignment: Assignment): Promise<void>;
  abstract delete(id: AssignmentId): Promise<void>;
}
