/**
 * Domain-owned repository token for the Assignment aggregate.
 */
export abstract class AssignmentRepository {
  abstract findById(id: string): Promise<unknown | null>;
  abstract findRunningByRouteId(routeId: string): Promise<unknown | null>;
  abstract findActiveByVehicleId(vehicleId: string): Promise<unknown | null>;
  abstract findActiveByDriverId(driverId: string): Promise<unknown | null>;
  abstract save(assignment: unknown): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
