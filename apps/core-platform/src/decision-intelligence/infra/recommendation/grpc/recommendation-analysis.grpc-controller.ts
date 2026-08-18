import { Injectable, type OnModuleInit } from "@nestjs/common";

import {
  RecommendationAnalysisServiceService,
  type RecommendationAnalysisServiceServer,
} from "../../../../shared/infra/grpc/generated/decision_intelligence/v1/recommendation_analysis_service";
import { GrpcServiceRegistry } from "../../../../shared/infra/grpc/grpc-service-registry";
import { GetRecommendationAnalysisContextHandler } from "../../../app/recommendation/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.handler";
import { GetRecommendationAnalysisContextQuery } from "../../../app/recommendation/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.query";
import { RecommendationAnalysisGrpcMapper } from "./recommendation-analysis.grpc-mapper";

/** Maps the RecommendationAnalysisService boundary to the Decision Intelligence read model. */
@Injectable()
export class RecommendationAnalysisGrpcController implements OnModuleInit {
  constructor(
    private readonly getRecommendationAnalysisContextHandler: GetRecommendationAnalysisContextHandler,
    private readonly registry: GrpcServiceRegistry,
  ) {}

  readonly handlers: RecommendationAnalysisServiceServer = {
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
    this.registry.register(
      RecommendationAnalysisServiceService,
      this.handlers,
    );
  }
}