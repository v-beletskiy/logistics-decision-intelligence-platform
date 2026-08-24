import { Module } from "@nestjs/common";

import { OptimizationWorkerModule } from "../modules/optimization/composition/optimization-worker.module.js";
import { OptimizationExecutionConsumer } from "../modules/optimization/infra/messaging/inbound/optimization-execution.consumer.js";
import { RecommendationWorkerModule } from "../modules/recommendation/composition/recommendation-worker.module.js";
import { RecommendationAnalysisCompletedConsumer } from "../modules/recommendation/infra/messaging/inbound/recommendation-analysis-completed.consumer.js";

@Module({
  imports: [OptimizationWorkerModule, RecommendationWorkerModule],
  providers: [OptimizationExecutionConsumer, RecommendationAnalysisCompletedConsumer],
})
export class DecisionIntelligenceWorkerModule {}
