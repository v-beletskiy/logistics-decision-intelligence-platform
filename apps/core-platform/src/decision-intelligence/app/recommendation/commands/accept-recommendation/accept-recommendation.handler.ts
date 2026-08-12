import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { AcceptRecommendationCommand } from './accept-recommendation.command';

@Injectable()
export class AcceptRecommendationHandler {
  async execute(
    _request: ExecutionRequest<AcceptRecommendationCommand>,
  ): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
