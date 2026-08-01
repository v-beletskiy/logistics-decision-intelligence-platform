import { Injectable } from '@nestjs/common';

import { ChangeVehicleAvailabilityCommand } from './change-vehicle-availability.command';

@Injectable()
export class ChangeVehicleAvailabilityHandler {
  async execute(_command: ChangeVehicleAvailabilityCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
