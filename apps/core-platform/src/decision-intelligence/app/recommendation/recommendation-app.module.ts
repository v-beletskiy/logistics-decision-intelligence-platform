import { Module } from '@nestjs/common';

import { AcceptRecommendationHandler } from './commands/accept-recommendation/accept-recommendation.handler';
import { ExpireRecommendationsHandler } from './commands/expire-recommendations/expire-recommendations.handler';
import { RejectRecommendationHandler } from './commands/reject-recommendation/reject-recommendation.handler';
import { GetRecommendationHandler } from './queries/get-recommendation/get-recommendation.handler';
import { GetRecommendationAnalysisContextHandler } from './queries/get-recommendation-analysis-context/get-recommendation-analysis-context.handler';
import { RecommendationPersistenceModule } from '../../domain-modules/recommendation/infra/persistence/recommendation-persistence.module';

@Module({
  imports: [RecommendationPersistenceModule],
  providers: [
    AcceptRecommendationHandler,
    RejectRecommendationHandler,
    ExpireRecommendationsHandler,
    GetRecommendationHandler,
    GetRecommendationAnalysisContextHandler,
  ],
  exports: [
    AcceptRecommendationHandler,
    RejectRecommendationHandler,
    ExpireRecommendationsHandler,
    GetRecommendationHandler,
    GetRecommendationAnalysisContextHandler,
  ],
})
export class RecommendationAppModule {}
