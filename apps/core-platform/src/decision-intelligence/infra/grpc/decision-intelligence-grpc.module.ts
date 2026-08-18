import { Module } from "@nestjs/common";

import { DecisionIntelligenceAppModule } from "../../app/decision-intelligence-app.module";
import { RecommendationAnalysisGrpcController } from "../recommendation/grpc/recommendation-analysis.grpc-controller";

@Module({
  imports: [DecisionIntelligenceAppModule],
  providers: [RecommendationAnalysisGrpcController],
})
export class DecisionIntelligenceGrpcModule {}