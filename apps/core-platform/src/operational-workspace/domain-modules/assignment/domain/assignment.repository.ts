import type { Assignment } from "./assignment.aggregate";
import type { AssignmentId } from "./assignment-id";

export abstract class AssignmentRepository {
  abstract findById(id: AssignmentId): Promise<Assignment | null>;
  abstract findByIds(ids: readonly string[]): Promise<readonly Assignment[]>;
  abstract findActiveByRouteId(routeId: string): Promise<Assignment | null>;
  abstract findActiveByVehicleId(vehicleId: string): Promise<Assignment | null>;
  abstract findActiveByDriverId(driverId: string): Promise<Assignment | null>;
  abstract save(assignment: Assignment): Promise<void>;
  abstract delete(id: AssignmentId): Promise<void>;
}
