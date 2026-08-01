import { Injectable } from '@nestjs/common';

import { ChangeDriverAvailabilityCommand } from './change-driver-availability.command';

@Injectable()
export class ChangeDriverAvailabilityHandler {
  async execute(_command: ChangeDriverAvailabilityCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
