import { Module } from "@nestjs/common";

import { RecommendationRepository } from "../../domain/recommendation.repository.js";
import { PgRecommendationRepository } from "./repository/pg-recommendation.repository.js";

@Module({
  providers: [
    {
      provide: RecommendationRepository,
      useClass: PgRecommendationRepository,
    },
  ],
  exports: [RecommendationRepository],
})
export class RecommendationPersistenceModule {}
