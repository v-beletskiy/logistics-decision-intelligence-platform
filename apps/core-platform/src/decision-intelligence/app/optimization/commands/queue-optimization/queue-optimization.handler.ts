import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { QueueOptimizationCommand } from './queue-optimization.command';

@Injectable()
export class QueueOptimizationHandler {
  async execute(
    _request: ExecutionRequest<QueueOptimizationCommand>,
  ): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
