import { Module } from '@nestjs/common';

import { DecisionIntelligenceAppModule } from '../../app/decision-intelligence-app.module';
import { OptimizationController } from '../optimization/http/optimization.controller';
import { RecommendationController } from '../recommendation/http/recommendation.controller';

@Module({
  imports: [DecisionIntelligenceAppModule],
  controllers: [OptimizationController, RecommendationController],
})
export class DecisionIntelligenceHttpModule {}
