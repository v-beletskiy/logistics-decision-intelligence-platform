import { Injectable } from '@nestjs/common';

import { RegisterVehicleCommand } from './register-vehicle.command';

@Injectable()
export class RegisterVehicleHandler {
  async execute(_command: RegisterVehicleCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
