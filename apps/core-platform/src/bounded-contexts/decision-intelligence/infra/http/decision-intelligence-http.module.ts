import { Module } from "@nestjs/common";

import { RecommendationQueryModule } from "../../modules/recommendation/composition/recommendation-query.module.js";
import { RecommendationController } from "../../modules/recommendation/infra/http/recommendation.controller.js";

@Module({
  imports: [RecommendationQueryModule],
  controllers: [RecommendationController],
})
export class DecisionIntelligenceHttpModule {}
