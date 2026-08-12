import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { ExpireRecommendationsCommand } from './expire-recommendations.command';

@Injectable()
export class ExpireRecommendationsHandler {
  async execute(
    _request: ExecutionRequest<ExpireRecommendationsCommand>,
  ): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
