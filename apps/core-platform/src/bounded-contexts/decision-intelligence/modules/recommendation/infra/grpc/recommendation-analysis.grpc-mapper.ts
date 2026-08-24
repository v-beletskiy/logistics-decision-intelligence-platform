import type {
  RecommendationContext,
  RecommendationFact,
} from "../../../../../../shared/infra/grpc/generated/decision_intelligence/v1/recommendation_analysis_types.js";
import type { RecommendationAnalysisContextResult } from "../../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.result.js";

export class RecommendationAnalysisGrpcMapper {
  static toContext(
    context: RecommendationAnalysisContextResult,
  ): RecommendationContext {
    return {
      id: context.recommendationId,
      routeId: context.routeId,
      type: context.type,
      status: context.status,
      score: context.score,
      proposedRouteStopIds: [...context.proposedRouteStopIds],
      facts: context.facts.map((fact): RecommendationFact => ({
        metric: fact.metric,
        baselineValue: fact.baselineValue,
        recommendedValue: fact.recommendedValue,
        unit: fact.unit,
        improvement: fact.improvement,
      })),
    };
  }
}
