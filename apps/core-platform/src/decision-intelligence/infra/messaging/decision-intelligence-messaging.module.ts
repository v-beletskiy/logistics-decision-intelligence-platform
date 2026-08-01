import { Module } from '@nestjs/common';

import { DecisionIntelligenceAppModule } from '../../app/decision-intelligence-app.module';

@Module({
  imports: [DecisionIntelligenceAppModule],
})
export class DecisionIntelligenceMessagingModule {}
