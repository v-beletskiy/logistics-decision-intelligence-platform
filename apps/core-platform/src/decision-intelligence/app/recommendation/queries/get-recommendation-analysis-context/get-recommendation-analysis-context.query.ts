export class GetRecommendationAnalysisContextQuery {
  constructor(
    readonly tenantId: string,
    readonly recommendationId: string,
  ) {}
}