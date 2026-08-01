import { Module } from '@nestjs/common';

import { QueueOptimizationHandler } from './app/optimization/commands/queue-optimization/queue-optimization.handler';
import { ExecuteOptimizationHandler } from './app/optimization/commands/execute-optimization/execute-optimization.handler';
import { CompleteRecommendationAnalysisHandler } from './app/optimization/commands/complete-recommendation-analysis/complete-recommendation-analysis.handler';
import { AcceptRecommendationHandler } from './app/recommendation/commands/accept-recommendation/accept-recommendation.handler';
import { RejectRecommendationHandler } from './app/recommendation/commands/reject-recommendation/reject-recommendation.handler';
import { ExpireRecommendationsHandler } from './app/recommendation/commands/expire-recommendations/expire-recommendations.handler';
import { GetRecommendationHandler } from './app/recommendation/queries/get-recommendation/get-recommendation.handler';
import { OptimizationRepository } from './domain-modules/optimization/domain/optimization.repository';
import { PgOptimizationRepository } from './domain-modules/optimization/infra/persistence/optimization.pg-repository';
import { RecommendationRepository } from './domain-modules/recommendation/domain/recommendation.repository';
import { PgRecommendationRepository } from './domain-modules/recommendation/infra/persistence/recommendation.pg-repository';
import { OptimizationController } from './infra/optimization/http/optimization.controller';
import { RecommendationController } from './infra/recommendation/http/recommendation.controller';

@Module({
  controllers: [OptimizationController, RecommendationController],
  providers: [
    QueueOptimizationHandler,
    ExecuteOptimizationHandler,
    CompleteRecommendationAnalysisHandler,
    AcceptRecommendationHandler,
    RejectRecommendationHandler,
    ExpireRecommendationsHandler,
    GetRecommendationHandler,
    {
      provide: OptimizationRepository,
      useClass: PgOptimizationRepository,
    },
    {
      provide: RecommendationRepository,
      useClass: PgRecommendationRepository,
    },
  ],
})
export class DecisionIntelligenceModule {}
