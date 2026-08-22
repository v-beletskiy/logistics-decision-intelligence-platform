import type { RecommendationMetric } from "../../../../../domain/recommendation-metric.enum";
import type { RecommendationType } from "../../../../../domain/recommendation-type.enum";
import type { RecommendationStatus } from "../../../domain/recommendation.enums";
import type { MeasurementUnit } from "../../../../../domain/measurement-unit.enum";

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
