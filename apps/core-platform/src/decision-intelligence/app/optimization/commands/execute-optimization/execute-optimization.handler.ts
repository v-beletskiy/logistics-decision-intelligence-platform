import { Injectable } from '@nestjs/common';

import { ExecuteOptimizationCommand } from './execute-optimization.command';

@Injectable()
export class ExecuteOptimizationHandler {
  async execute(_command: ExecuteOptimizationCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
