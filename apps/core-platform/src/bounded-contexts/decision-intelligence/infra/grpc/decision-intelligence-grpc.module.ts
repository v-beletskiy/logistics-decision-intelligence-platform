import { Module } from "@nestjs/common";

import { RecommendationQueryModule } from "../../modules/recommendation/composition/recommendation-query.module";
import { RecommendationAnalysisGrpcController } from "../../modules/recommendation/infra/grpc/recommendation-analysis.grpc-controller";

@Module({
  imports: [RecommendationQueryModule],
  providers: [RecommendationAnalysisGrpcController],
})
export class DecisionIntelligenceGrpcModule {}
