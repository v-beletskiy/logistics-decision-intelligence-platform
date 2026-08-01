import { Injectable } from '@nestjs/common';

import { CompleteRecommendationAnalysisCommand } from './complete-recommendation-analysis.command';

@Injectable()
export class CompleteRecommendationAnalysisHandler {
  async execute(_command: CompleteRecommendationAnalysisCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
