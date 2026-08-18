import type { RecommendationMetric } from "../../../../shared-domain/shared-kernel/enums/recommendation-metric.enum";
import type { RecommendationType } from "../../../../shared-domain/shared-kernel/enums/recommendation-type.enum";
import type { RecommendationStatus } from "../../../../domain-modules/recommendation/domain/recommendation.enums";
import type { MeasurementUnit } from "../../../../shared-domain/shared-kernel/enums/measurement-unit.enum";

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