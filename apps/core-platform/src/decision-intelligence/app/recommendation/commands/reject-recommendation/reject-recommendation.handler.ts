import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { RejectRecommendationCommand } from './reject-recommendation.command';

@Injectable()
export class RejectRecommendationHandler {
  async exec(
    _request: ExecutionRequest<RejectRecommendationCommand>,
  ): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
