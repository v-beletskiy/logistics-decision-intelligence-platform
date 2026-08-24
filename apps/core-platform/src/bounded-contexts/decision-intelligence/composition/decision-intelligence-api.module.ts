import { Module } from "@nestjs/common";

import { DecisionIntelligenceGrpcModule } from "../infra/grpc/decision-intelligence-grpc.module.js";
import { DecisionIntelligenceHttpModule } from "../infra/http/decision-intelligence-http.module.js";
import { DecisionIntelligenceApplicationEventsModule } from "./decision-intelligence-application-events.module.js";

@Module({
  imports: [
    DecisionIntelligenceGrpcModule,
    DecisionIntelligenceHttpModule,
    DecisionIntelligenceApplicationEventsModule,
  ],
})
export class DecisionIntelligenceApiModule {}
