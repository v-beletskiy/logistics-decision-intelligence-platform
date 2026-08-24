import { Module } from "@nestjs/common";

import { CompleteRecommendationAnalysisHandler } from "../app/commands/complete-recommendation-analysis/complete-recommendation-analysis.handler.js";
import { RecommendationPersistenceModule } from "../infra/persistence/recommendation-persistence.module.js";

@Module({
  imports: [RecommendationPersistenceModule],
  providers: [CompleteRecommendationAnalysisHandler],
  exports: [CompleteRecommendationAnalysisHandler],
})
export class RecommendationWorkerModule {}
