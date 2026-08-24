import { Module } from "@nestjs/common";

import { DecisionIntelligenceGrpcModule } from "../infra/grpc/decision-intelligence-grpc.module.js";
import { DecisionIntelligenceApplicationEventsModule } from "./decision-intelligence-application-events.module.js";

@Module({
  imports: [
    DecisionIntelligenceGrpcModule,
    DecisionIntelligenceApplicationEventsModule,
  ],
})
export class DecisionIntelligenceApiModule {}
