import { Injectable } from '@nestjs/common';

import { QueueOptimizationCommand } from './queue-optimization.command';

@Injectable()
export class QueueOptimizationHandler {
  async execute(_command: QueueOptimizationCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
