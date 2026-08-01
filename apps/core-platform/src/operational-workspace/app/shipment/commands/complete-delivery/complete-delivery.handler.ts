import { Injectable } from '@nestjs/common';

import { CompleteDeliveryCommand } from './complete-delivery.command';

@Injectable()
export class CompleteDeliveryHandler {
  async execute(_command: CompleteDeliveryCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
