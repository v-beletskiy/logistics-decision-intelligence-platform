import { Injectable } from '@nestjs/common';

import { GetRecommendationQuery } from './get-recommendation.query';
import type { GetRecommendationResult } from './get-recommendation.result';

@Injectable()
export class GetRecommendationHandler {
  async execute(_query: GetRecommendationQuery): Promise<GetRecommendationResult> {
    // Read-model access is intentionally deferred.
    return {};
  }
}
