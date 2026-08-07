import { Injectable } from '@nestjs/common';

import { AssignmentRepository } from '../../domain/assignment.repository';

@Injectable()
export class PgAssignmentRepository extends AssignmentRepository {
  async findById(id: string): Promise<unknown | null> {
    void id;
    throw new Error("Assignment persistence is not implemented.");
  }

  async findRunningByRouteId(routeId: string): Promise<unknown | null> {
    void routeId;
    throw new Error("Assignment persistence is not implemented.");
  }

  async findActiveByVehicleId(vehicleId: string): Promise<unknown | null> {
    void vehicleId;
    throw new Error("Assignment persistence is not implemented.");
  }

  async findActiveByDriverId(driverId: string): Promise<unknown | null> {
    void driverId;
    throw new Error("Assignment persistence is not implemented.");
  }

  async save(assignment: unknown): Promise<void> {
    void assignment;
    throw new Error("Assignment persistence is not implemented.");
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error("Assignment persistence is not implemented.");
  }
}
