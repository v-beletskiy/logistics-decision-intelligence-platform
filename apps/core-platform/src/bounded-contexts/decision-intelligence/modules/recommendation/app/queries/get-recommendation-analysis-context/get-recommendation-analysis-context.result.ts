import type { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum.js";
import type { RecommendationType } from "../../../../../domain/recommendation-type.enum.js";
import type { RecommendationStatus } from "../../../domain/recommendation.enums.js";
import type { MeasurementUnit } from "../../../../../domain/measurement-unit.enum.js";

export interface RecommendationAnalysisFactResult {
  readonly metric: RecommendationMetric;
  readonly baselineValue: number;
  readonly recommendedValue: number;
  readonly unit: MeasurementUnit;
  readonly improvement: number;
}

export interface RecommendationAnalysisContextResult {
  readonly recommendationId: string;
  readonly routeId: string;
  readonly type: RecommendationType;
  readonly status: RecommendationStatus;
  readonly score: number;
  readonly facts: readonly RecommendationAnalysisFactResult[];
}
