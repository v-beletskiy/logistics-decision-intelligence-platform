import { Module } from "@nestjs/common";

import { OptimizationQueueAppModule } from "../modules/optimization/app/optimization-queue-app.module";
import { RecommendationAppModule } from "../modules/recommendation/app/recommendation-app.module";

@Module({
  imports: [OptimizationQueueAppModule, RecommendationAppModule],
  exports: [OptimizationQueueAppModule, RecommendationAppModule],
})
export class DecisionIntelligenceAppModule {}
