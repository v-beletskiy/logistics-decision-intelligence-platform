import { Module } from "@nestjs/common";

import { GetRecommendationAnalysisContextHandler } from "../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.handler.js";
import { ListRecommendationsByRouteHandler } from "../app/queries/list-recommendations-by-route/list-recommendations-by-route.handler.js";
import { RecommendationPersistenceModule } from "../infra/persistence/recommendation-persistence.module.js";

@Module({
  imports: [RecommendationPersistenceModule],
  providers: [
    GetRecommendationAnalysisContextHandler,
    ListRecommendationsByRouteHandler,
  ],
  exports: [
    GetRecommendationAnalysisContextHandler,
    ListRecommendationsByRouteHandler,
  ],
})
export class RecommendationQueryModule {}
