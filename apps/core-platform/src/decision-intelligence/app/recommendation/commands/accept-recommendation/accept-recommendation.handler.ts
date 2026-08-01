import { Injectable } from '@nestjs/common';

import { AcceptRecommendationCommand } from './accept-recommendation.command';

@Injectable()
export class AcceptRecommendationHandler {
  async execute(_command: AcceptRecommendationCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
