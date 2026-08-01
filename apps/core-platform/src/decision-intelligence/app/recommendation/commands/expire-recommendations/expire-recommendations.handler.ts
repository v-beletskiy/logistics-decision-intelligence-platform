import { Injectable } from '@nestjs/common';

import { ExpireRecommendationsCommand } from './expire-recommendations.command';

@Injectable()
export class ExpireRecommendationsHandler {
  async execute(_command: ExpireRecommendationsCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
