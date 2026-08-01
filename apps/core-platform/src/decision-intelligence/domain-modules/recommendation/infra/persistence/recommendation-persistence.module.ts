import { Module } from '@nestjs/common';

import { RecommendationRepository } from '../../domain/recommendation.repository';
import { PgRecommendationRepository } from './recommendation.pg-repository';

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
