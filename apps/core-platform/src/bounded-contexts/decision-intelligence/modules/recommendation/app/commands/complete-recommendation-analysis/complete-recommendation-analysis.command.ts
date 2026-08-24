import type { FindingCategory } from "../../../domain/recommendation.enums.js";

export interface CompletedRecommendationAnalysis {
  readonly summary: string;
  readonly confidence: number;
  readonly findings: readonly {
    readonly category: FindingCategory;
    readonly title: string;
    readonly description: string;
  }[];
}

export class CompleteRecommendationAnalysisCommand {
  constructor(
    readonly tenantId: string,
    readonly recommendationId: string,
    readonly requestEventId: string,
    readonly analysis: CompletedRecommendationAnalysis,
  ) {}
}
