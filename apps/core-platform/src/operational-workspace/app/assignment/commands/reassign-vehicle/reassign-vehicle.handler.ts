import { Injectable } from '@nestjs/common';

import { ReassignVehicleCommand } from './reassign-vehicle.command';

@Injectable()
export class ReassignVehicleHandler {
  async execute(_command: ReassignVehicleCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
