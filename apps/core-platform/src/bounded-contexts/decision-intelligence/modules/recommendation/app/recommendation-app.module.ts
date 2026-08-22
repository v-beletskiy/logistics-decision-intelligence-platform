import { Module } from "@nestjs/common";

import { GetRecommendationAnalysisContextHandler } from "./queries/get-recommendation-analysis-context/get-recommendation-analysis-context.handler";
import { RecommendationPersistenceModule } from "../infra/persistence/recommendation-persistence.module";

@Module({
  imports: [RecommendationPersistenceModule],
  providers: [GetRecommendationAnalysisContextHandler],
  exports: [GetRecommendationAnalysisContextHandler],
})
export class RecommendationAppModule {}
