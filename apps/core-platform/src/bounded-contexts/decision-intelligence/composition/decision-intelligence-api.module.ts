import { Module } from "@nestjs/common";

import { DecisionIntelligenceGrpcModule } from "../infra/grpc/decision-intelligence-grpc.module";
import { DecisionIntelligenceApplicationEventsModule } from "./decision-intelligence-application-events.module";

@Module({
  imports: [
    DecisionIntelligenceGrpcModule,
    DecisionIntelligenceApplicationEventsModule,
  ],
})
export class DecisionIntelligenceApiModule {}
