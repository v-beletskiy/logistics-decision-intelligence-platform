import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { CompleteRecommendationAnalysisCommand } from './complete-recommendation-analysis.command';

@Injectable()
export class CompleteRecommendationAnalysisHandler {
  async exec(
    _request: ExecutionRequest<CompleteRecommendationAnalysisCommand>,
  ): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
