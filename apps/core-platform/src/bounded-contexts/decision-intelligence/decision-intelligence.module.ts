import { Module } from "@nestjs/common";

import { DecisionIntelligenceAppModule } from "./app/decision-intelligence-app.module";
import { DecisionIntelligenceGrpcModule } from "./infra/grpc/decision-intelligence-grpc.module";

@Module({
  imports: [DecisionIntelligenceAppModule, DecisionIntelligenceGrpcModule],
})
export class DecisionIntelligenceModule {}
