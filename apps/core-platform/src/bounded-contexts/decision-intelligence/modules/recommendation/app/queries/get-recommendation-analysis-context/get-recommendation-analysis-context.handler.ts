import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { RecommendationRepository } from "../../../domain/recommendation.repository";
import { RecommendationId } from "../../../domain/recommendation-id";
import { GetRecommendationAnalysisContextQuery } from "./get-recommendation-analysis-context.query";
import type { RecommendationAnalysisContextResult } from "./get-recommendation-analysis-context.result";

@Injectable()
export class GetRecommendationAnalysisContextHandler {
  constructor(
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  async exec(
    query: GetRecommendationAnalysisContextQuery,
  ): Promise<RecommendationAnalysisContextResult> {
    const recommendation = await this.recommendationRepository.findById(
      query.tenantId,
      RecommendationId.from(query.recommendationId),
    );
    if (!recommendation) {
      throw new AggregateNotFoundException("Recommendation");
    }

    return {
      recommendationId: recommendation.id.value,
      routeId: recommendation.routeId.value,
      type: recommendation.type,
      status: recommendation.status,
      score: recommendation.score,
      facts: recommendation.facts.map((fact) => ({
        metric: fact.metric,
        baselineValue: fact.baselineValue,
        recommendedValue: fact.recommendedValue,
        unit: fact.unit,
        improvement: fact.improvement,
      })),
    } satisfies RecommendationAnalysisContextResult;
  }
}
