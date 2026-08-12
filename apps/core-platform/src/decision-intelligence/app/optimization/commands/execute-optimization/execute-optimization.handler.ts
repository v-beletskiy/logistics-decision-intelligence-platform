import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { ExecuteOptimizationCommand } from './execute-optimization.command';

@Injectable()
export class ExecuteOptimizationHandler {
  async execute(
    _request: ExecutionRequest<ExecuteOptimizationCommand>,
  ): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
