import { Injectable } from '@nestjs/common';

import { RejectRecommendationCommand } from './reject-recommendation.command';

@Injectable()
export class RejectRecommendationHandler {
  async execute(_command: RejectRecommendationCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
