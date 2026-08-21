import { Module } from '@nestjs/common';

import { CompleteRecommendationAnalysisHandler } from './commands/complete-recommendation-analysis/complete-recommendation-analysis.handler';
import { ExecuteOptimizationHandler } from './commands/execute-optimization/execute-optimization.handler';
import { QueueOptimizationHandler } from './event-handlers/queue-optimization/queue-optimization.handler';
import { OperationalWorkspaceAppModule } from '../../../operational-workspace/app/operational-workspace-app.module';
import { OptimizationPersistenceModule } from '../../domain-modules/optimization/infra/persistence/optimization-persistence.module';
import { RecommendationPersistenceModule } from '../../domain-modules/recommendation/infra/persistence/recommendation-persistence.module';
import { RouteOptimizationTriggerPolicy } from '../../domain-modules/optimization/domain/route-optimization-trigger.policy';
import { OptimizationTriggerPolicy } from '../../domain-modules/optimization/domain/optimization-trigger.policy';
import { OptimizationCostModel } from '../../domain-modules/optimization/domain/optimization-cost-model';
import { RouteOptimizationEvaluator } from '../../domain-modules/optimization/domain/route-optimization-evaluator';
import { OptimizationInfraModule } from '../../infra/optimization/optimization-infra.module';

@Module({
  imports: [
    OptimizationPersistenceModule,
    RecommendationPersistenceModule,
    OptimizationInfraModule,
    OperationalWorkspaceAppModule,
  ],
  providers: [
    QueueOptimizationHandler,
    ExecuteOptimizationHandler,
    CompleteRecommendationAnalysisHandler,
    {
      provide: OptimizationTriggerPolicy,
      useClass: RouteOptimizationTriggerPolicy,
    },
    {
      provide: OptimizationCostModel,
      useValue: OptimizationCostModel.create(),
    },
    RouteOptimizationEvaluator,
  ],
  exports: [
    QueueOptimizationHandler,
    ExecuteOptimizationHandler,
    CompleteRecommendationAnalysisHandler,
    OptimizationTriggerPolicy,
    OptimizationCostModel,
    RouteOptimizationEvaluator,
  ],
})
export class OptimizationAppModule {}