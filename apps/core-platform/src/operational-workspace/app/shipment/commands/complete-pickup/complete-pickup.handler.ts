import { Injectable } from '@nestjs/common';

import { CompletePickupCommand } from './complete-pickup.command';

@Injectable()
export class CompletePickupHandler {
  async execute(_command: CompletePickupCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
