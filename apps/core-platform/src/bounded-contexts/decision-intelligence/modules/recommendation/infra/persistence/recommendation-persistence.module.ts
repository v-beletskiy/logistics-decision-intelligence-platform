import { Module } from "@nestjs/common";

import { RecommendationReadStore } from "../../app/ports/recommendation-read-store.js";
import { RecommendationRepository } from "../../domain/recommendation.repository.js";
import { PgRecommendationReadStore } from "./read-store/pg-recommendation.read-store.js";
import { PgRecommendationRepository } from "./repository/pg-recommendation.repository.js";

@Module({
  providers: [
    {
      provide: RecommendationRepository,
      useClass: PgRecommendationRepository,
    },
    {
      provide: RecommendationReadStore,
      useClass: PgRecommendationReadStore,
    },
  ],
  exports: [RecommendationRepository, RecommendationReadStore],
})
export class RecommendationPersistenceModule {}
