import { Module } from '@nestjs/common';

import { CompleteRecommendationAnalysisHandler } from './commands/complete-recommendation-analysis/complete-recommendation-analysis.handler';
import { ExecuteOptimizationHandler } from './commands/execute-optimization/execute-optimization.handler';
import { QueueOptimizationHandler } from './event-handlers/queue-optimization/queue-optimization.handler';
import { OptimizationPersistenceModule } from '../../domain-modules/optimization/infra/persistence/optimization-persistence.module';
import { RecommendationPersistenceModule } from '../../domain-modules/recommendation/infra/persistence/recommendation-persistence.module';

@Module({
  imports: [OptimizationPersistenceModule, RecommendationPersistenceModule],
  providers: [
    QueueOptimizationHandler,
    ExecuteOptimizationHandler,
    CompleteRecommendationAnalysisHandler,
  ],
  exports: [
    QueueOptimizationHandler,
    ExecuteOptimizationHandler,
    CompleteRecommendationAnalysisHandler,
  ],
})
export class OptimizationAppModule {}
