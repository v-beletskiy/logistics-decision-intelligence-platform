import type { MeasurementUnit } from "../../../../domain/measurement-unit.enum.js";
import type { RecommendationMetric } from "../../../../domain/recommendation-metric.enum.js";
import type { RecommendationType } from "../../../../domain/recommendation-type.enum.js";
import type {
  FindingCategory,
  RecommendationAnalysisStatus,
  RecommendationStatus,
} from "../../domain/recommendation.enums.js";

export interface RecommendationFactListItem {
  readonly metric: RecommendationMetric;
  readonly baselineValue: number;
  readonly recommendedValue: number;
  readonly unit: MeasurementUnit;
  readonly improvement: number;
}

export interface RecommendationFindingListItem {
  readonly category: FindingCategory;
  readonly title: string;
  readonly description: string;
}

export interface RecommendationAnalysisListItem {
  readonly summary: string;
  readonly confidence: number;
  readonly findings: readonly RecommendationFindingListItem[];
}

export interface RecommendationListItem {
  readonly id: string;
  readonly optimizationId: string;
  readonly type: RecommendationType;
  readonly status: RecommendationStatus;
  readonly score: number;
  readonly proposedRouteStopIds: readonly string[];
  readonly facts: readonly RecommendationFactListItem[];
  readonly analysisStatus: RecommendationAnalysisStatus;
  readonly analysis?: RecommendationAnalysisListItem;
}

export abstract class RecommendationReadStore {
  abstract listByRouteId(
    tenantId: string,
    routeId: string,
  ): Promise<readonly RecommendationListItem[]>;
}
