import { Injectable } from '@nestjs/common';

import { UpdateVehicleDetailsCommand } from './update-vehicle-details.command';

@Injectable()
export class UpdateVehicleDetailsHandler {
  async execute(_command: UpdateVehicleDetailsCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
