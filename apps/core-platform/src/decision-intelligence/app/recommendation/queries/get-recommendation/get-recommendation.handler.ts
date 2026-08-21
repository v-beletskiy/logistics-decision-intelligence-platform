import { Injectable } from '@nestjs/common';

import type { ExecutionRequest } from '../../../../../shared/app/execution/execution-context';
import { GetRecommendationQuery } from './get-recommendation.query';
import type { GetRecommendationResult } from './get-recommendation.result';

@Injectable()
export class GetRecommendationHandler {
  async exec(
    _request: ExecutionRequest<GetRecommendationQuery>,
  ): Promise<GetRecommendationResult> {
    // Read-model access is intentionally deferred.
    return {};
  }
}
