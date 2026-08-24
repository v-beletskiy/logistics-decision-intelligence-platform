import { Module } from "@nestjs/common";

import { RecommendationPersistenceModule } from "../../recommendation/infra/persistence/recommendation-persistence.module.js";
import { ExecuteOptimizationHandler } from "../app/commands/execute-optimization/execute-optimization.handler.js";
import { OptimizationCostModel } from "../domain/optimization-cost-model.js";
import { RouteOptimizationEvaluator } from "../domain/route-optimization-evaluator.js";
import { OptimizationInfraModule } from "../infra/optimization-infra.module.js";
import { OperationalWorkspaceRouteInputModule } from "../infra/operational-workspace/operational-workspace-route-input.module.js";
import { OptimizationPersistenceModule } from "../infra/persistence/optimization-persistence.module.js";

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
