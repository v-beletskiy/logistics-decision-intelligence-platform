import { Module } from '@nestjs/common';

import { DecisionIntelligenceAppModule } from './app/decision-intelligence-app.module';
import { DecisionIntelligenceGrpcModule } from './infra/grpc/decision-intelligence-grpc.module';
import { DecisionIntelligenceHttpModule } from './infra/http/decision-intelligence-http.module';
import { DecisionIntelligenceMessagingModule } from './infra/messaging/decision-intelligence-messaging.module';

@Module({
  imports: [
    DecisionIntelligenceAppModule,
    DecisionIntelligenceHttpModule,
    DecisionIntelligenceMessagingModule,
    DecisionIntelligenceGrpcModule,
  ],
})
export class DecisionIntelligenceModule {}
