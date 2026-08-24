import { Module } from "@nestjs/common";

import { RecommendationQueryModule } from "../../modules/recommendation/composition/recommendation-query.module.js";
import { RecommendationAnalysisGrpcController } from "../../modules/recommendation/infra/grpc/recommendation-analysis.grpc-controller.js";

@Module({
  imports: [RecommendationQueryModule],
  providers: [RecommendationAnalysisGrpcController],
})
export class DecisionIntelligenceGrpcModule {}
