import { Injectable } from '@nestjs/common';

import { DecommissionVehicleCommand } from './decommission-vehicle.command';

@Injectable()
export class DecommissionVehicleHandler {
  async execute(_command: DecommissionVehicleCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
