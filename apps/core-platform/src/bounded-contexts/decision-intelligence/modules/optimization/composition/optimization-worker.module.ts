import { Module } from "@nestjs/common";

import { RecommendationPersistenceModule } from "../../recommendation/infra/persistence/recommendation-persistence.module";
import { ExecuteOptimizationHandler } from "../app/commands/execute-optimization/execute-optimization.handler";
import { OptimizationCostModel } from "../domain/optimization-cost-model";
import { RouteOptimizationEvaluator } from "../domain/route-optimization-evaluator";
import { OptimizationInfraModule } from "../infra/optimization-infra.module";
import { OperationalWorkspaceRouteInputModule } from "../infra/operational-workspace/operational-workspace-route-input.module";
import { OptimizationPersistenceModule } from "../infra/persistence/optimization-persistence.module";

@Module({
  imports: [
    OptimizationPersistenceModule,
    RecommendationPersistenceModule,
    OptimizationInfraModule,
    OperationalWorkspaceRouteInputModule,
  ],
  providers: [
    ExecuteOptimizationHandler,
    {
      provide: OptimizationCostModel,
      useValue: OptimizationCostModel.create(),
    },
    RouteOptimizationEvaluator,
  ],
  exports: [ExecuteOptimizationHandler],
})
export class OptimizationWorkerModule {}
