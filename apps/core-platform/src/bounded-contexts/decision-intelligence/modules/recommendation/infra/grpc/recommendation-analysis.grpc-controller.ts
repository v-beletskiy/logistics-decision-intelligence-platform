import { Injectable, type OnModuleInit } from "@nestjs/common";

import {
  RecommendationAnalysisService,
  type RecommendationAnalysisServer,
} from "../../../../../../shared/infra/grpc/generated/decision_intelligence/v1/recommendation_analysis_service.js";
import { GrpcServiceRegistry } from "../../../../../../shared/infra/grpc/grpc-service-registry.js";
import { GetRecommendationAnalysisContextHandler } from "../../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.handler.js";
import { GetRecommendationAnalysisContextQuery } from "../../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.query.js";
import { RecommendationAnalysisGrpcMapper } from "./recommendation-analysis.grpc-mapper.js";

/** Maps the RecommendationAnalysis gRPC boundary to the Decision Intelligence read model. */
@Injectable()
export class RecommendationAnalysisGrpcController implements OnModuleInit {
  constructor(
    private readonly getRecommendationAnalysisContextHandler: GetRecommendationAnalysisContextHandler,
    private readonly registry: GrpcServiceRegistry,
  ) {}

  readonly handlers: RecommendationAnalysisServer = {
    getRecommendationAnalysisContext: async (call, callback) => {
      const context = await this.getRecommendationAnalysisContextHandler.exec(
        new GetRecommendationAnalysisContextQuery(
          call.request.tenantId,
          call.request.recommendationId,
        ),
      );
      callback(null, {
        recommendation: RecommendationAnalysisGrpcMapper.toContext(context),
      });
    },
  };

  onModuleInit(): void {
    this.registry.register(RecommendationAnalysisService, this.handlers);
  }
}
