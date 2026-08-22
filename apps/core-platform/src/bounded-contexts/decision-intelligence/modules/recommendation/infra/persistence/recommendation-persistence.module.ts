import { Module } from "@nestjs/common";

import { RecommendationRepository } from "../../domain/recommendation.repository";
import { PgRecommendationRepository } from "./repository/pg-recommendation.repository";

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
