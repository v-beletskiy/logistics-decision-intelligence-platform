import { Module } from '@nestjs/common';

import { OptimizationAppModule } from './optimization/optimization-app.module';
import { RecommendationAppModule } from './recommendation/recommendation-app.module';

@Module({
  imports: [OptimizationAppModule, RecommendationAppModule],
  exports: [OptimizationAppModule, RecommendationAppModule],
})
export class DecisionIntelligenceAppModule {}
