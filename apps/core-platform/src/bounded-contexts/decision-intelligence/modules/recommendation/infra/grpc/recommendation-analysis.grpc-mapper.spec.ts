import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RecommendationMetric } from "../../../../domain/recommendation-metric.enum.js";
import { RecommendationType } from "../../../../domain/recommendation-type.enum.js";
import { MeasurementUnit } from "../../../../domain/measurement-unit.enum.js";
import { RecommendationStatus } from "../../domain/recommendation.enums.js";
import type { RecommendationContext } from "../../../../../../shared/infra/grpc/generated/decision_intelligence/v1/recommendation_analysis_types.js";
import type { RecommendationAnalysisContextResult } from "../../app/queries/get-recommendation-analysis-context/get-recommendation-analysis-context.result.js";
import { RecommendationAnalysisGrpcMapper } from "./recommendation-analysis.grpc-mapper.js";

test("RecommendationAnalysisGrpcMapper maps a recommendation context", () => {
  const context: RecommendationAnalysisContextResult = {
    recommendationId: "00000000-0000-4000-8000-000000000001",
    routeId: "00000000-0000-4000-8000-000000000011",
    type: RecommendationType.OptimizeRoutePlan,
    status: RecommendationStatus.Pending,
    score: 87.5,
    facts: [
      {
        metric: RecommendationMetric.TotalDistance,
        baselineValue: 1200,
        recommendedValue: 1050,
        unit: MeasurementUnit.Kilometers,
        improvement: -12.5,
      },
    ],
  };

  const mapped: RecommendationContext =
    RecommendationAnalysisGrpcMapper.toContext(context);

  assert.equal(mapped.id, context.recommendationId);
  assert.equal(mapped.routeId, context.routeId);
  assert.equal(mapped.type, "OPTIMIZE_ROUTE_PLAN");
  assert.equal(mapped.status, "PENDING");
  assert.equal(mapped.score, 87.5);
  assert.equal(mapped.facts.length, 1);
  assert.deepEqual(mapped.facts[0], {
    metric: "TOTAL_DISTANCE",
    baselineValue: 1200,
    recommendedValue: 1050,
    unit: "KILOMETERS",
    improvement: -12.5,
  });
});
