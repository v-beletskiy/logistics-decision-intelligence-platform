import { RouteReference } from "../../../../../../domain/route-reference.js";
import { RouteStopReference } from "../../../../../../domain/route-stop-reference.js";
import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import { MeasurementUnit } from "../../../../../../domain/measurement-unit.enum.js";
import { RecommendationMetric } from "../../../../../../domain/recommendation-metric.enum.js";
import { RecommendationType } from "../../../../../../domain/recommendation-type.enum.js";
import { RecommendationFact } from "../../../../../../domain/recommendation-fact.entity.js";
import { RecommendationFactId } from "../../../../../../domain/recommendation-fact-id.js";
import { OptimizationId } from "../../../../../optimization/domain/optimization-id.js";
import { Finding } from "../../../../domain/finding.entity.js";
import { FindingId } from "../../../../domain/finding-id.js";
import { Recommendation } from "../../../../domain/recommendation.aggregate.js";
import { RecommendationAnalysis } from "../../../../domain/recommendation-analysis.value-object.js";
import {
  FindingCategory,
  RecommendationAnalysisStatus,
  RecommendationStatus,
} from "../../../../domain/recommendation.enums.js";
import { RecommendationId } from "../../../../domain/recommendation-id.js";
import { ProposedRoutePlan } from "../../../../domain/proposed-route-plan.value-object.js";
import type { IFindRecommendationByIdResult } from "../queries/recommendation.find-by-id.queries.js";
import type { IReconcileRecommendationFactsParams } from "../queries/recommendation.reconcile-facts.queries.js";
import type { IReconcileRecommendationFindingsParams } from "../queries/recommendation.reconcile-findings.queries.js";
import type { IAddRecommendationParams } from "../queries/recommendation.add.queries.js";
import type { IAddRecommendationsParams } from "../queries/recommendation.add-many.queries.js";
import type { IAddRecommendationRoutePlanStopsParams } from "../queries/recommendation.add-route-plan-stops.queries.js";

interface RecommendationFactPersistenceData {
  readonly id: string;
  readonly metric: RecommendationMetric;
  readonly baselineValue: number;
  readonly recommendedValue: number;
  readonly unit: MeasurementUnit;
  readonly improvement: number;
}

interface FindingPersistenceData {
  readonly id: string;
  readonly category: FindingCategory;
  readonly title: string;
  readonly description: string;
}

/** Maps between the Recommendation aggregate and its PostgreSQL representation. */
export class RecommendationMapper {
  static toDomain(row: IFindRecommendationByIdResult): Recommendation {
    return hydratePersistenceData("recommendation", () => {
      const facts = (
        row.facts as unknown as readonly RecommendationFactPersistenceData[]
      ).map((fact) => {
        return RecommendationFact.reconstitute(
          RecommendationFactId.from(fact.id),
          {
            metric: fact.metric,
            baselineValue: fact.baselineValue,
            recommendedValue: fact.recommendedValue,
            unit: fact.unit,
            improvement: fact.improvement,
          },
        );
      });
      const findings = (
        row.findings as unknown as readonly FindingPersistenceData[]
      ).map((finding) =>
        Finding.reconstitute(FindingId.from(finding.id), {
          category: finding.category,
          title: finding.title,
          description: finding.description,
        }),
      );
      const analysis =
        row.summary !== null && row.confidence !== null
          ? RecommendationAnalysis.reconstitute({
              summary: row.summary,
              confidence: row.confidence,
              findings,
            })
          : undefined;
      const routeStopIds = row.proposed_route_stop_ids as unknown as readonly string[];
      const proposedRoutePlan =
        routeStopIds.length > 0
          ? ProposedRoutePlan.reconstitute({
              orderedRouteStopIds: routeStopIds.map(RouteStopReference.from),
            })
          : undefined;
      return Recommendation.reconstitute(RecommendationId.from(row.id), {
        routeId: RouteReference.from(row.route_id),
        optimizationId: OptimizationId.from(row.optimization_id),
        type: row.type as RecommendationType,
        proposedRoutePlan,
        status: row.status as RecommendationStatus,
        analysisRequestEventId: row.analysis_request_event_id ?? undefined,
        analysisStatus: row.analysis_status as RecommendationAnalysisStatus,
        facts,
        score: row.score,
        analysis,
      });
    });
  }

  static toPersistence(
    tenantId: string,
    recommendation: Recommendation,
  ): IAddRecommendationParams {
    return {
      tenantId,
      id: recommendation.id.value,
      routeId: recommendation.routeId.value,
      optimizationId: recommendation.optimizationId.value,
      type: recommendation.type,
      status: recommendation.status,
      analysisRequestEventId: recommendation.analysisRequestEventId ?? null,
      analysisStatus: recommendation.analysisStatus,
      score: recommendation.score,
      summary: recommendation.analysis?.summary ?? null,
      confidence: recommendation.analysis?.confidence ?? null,
    };
  }

  static toAddManyPersistence(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): IAddRecommendationsParams {
    return {
      tenantId,
      ids: recommendations.map((recommendation) => recommendation.id.value),
      routeIds: recommendations.map(
        (recommendation) => recommendation.routeId.value,
      ),
      optimizationIds: recommendations.map(
        (recommendation) => recommendation.optimizationId.value,
      ),
      types: recommendations.map((recommendation) => recommendation.type),
      statuses: recommendations.map((recommendation) => recommendation.status),
      analysisRequestEventIds: recommendations.map(
        (recommendation) => recommendation.analysisRequestEventId ?? null,
      ) as string[],
      analysisStatuses: recommendations.map(
        (recommendation) => recommendation.analysisStatus,
      ),
      scores: recommendations.map((recommendation) => recommendation.score),
      summaries: recommendations.map(
        (recommendation) => recommendation.analysis?.summary ?? null,
      ) as string[],
      confidences: recommendations.map(
        (recommendation) => recommendation.analysis?.confidence ?? null,
      ) as number[],
    };
  }

  static toAddRoutePlanStopsParams(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): IAddRecommendationRoutePlanStopsParams | undefined {
    const recommendationIds: string[] = [];
    const routeStopIds: string[] = [];
    const sequences: number[] = [];
    for (const recommendation of recommendations) {
      recommendation.proposedRoutePlan?.orderedRouteStopIds.forEach(
        (routeStopId, index) => {
          recommendationIds.push(recommendation.id.value);
          routeStopIds.push(routeStopId.value);
          sequences.push(index + 1);
        },
      );
    }
    return recommendationIds.length > 0
      ? { tenantId, recommendationIds, routeStopIds, sequences }
      : undefined;
  }

  static toReconcileFactsParams(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): IReconcileRecommendationFactsParams {
    const recommendationIds: string[] = [];
    const ids: string[] = [];
    const metrics: string[] = [];
    const baselineValues: number[] = [];
    const recommendedValues: number[] = [];
    const units: string[] = [];
    const improvements: number[] = [];
    for (const recommendation of recommendations) {
      for (const fact of recommendation.facts) {
        recommendationIds.push(recommendation.id.value);
        ids.push(fact.id.value);
        metrics.push(fact.metric);
        baselineValues.push(fact.baselineValue);
        recommendedValues.push(fact.recommendedValue);
        units.push(fact.unit);
        improvements.push(fact.improvement);
      }
    }
    return {
      tenantId,
      recommendationIds,
      ids,
      metrics,
      baselineValues,
      recommendedValues,
      units,
      improvements,
    };
  }

  static toReconcileFindingsParams(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): IReconcileRecommendationFindingsParams {
    const recommendationIds: string[] = [];
    const ids: string[] = [];
    const categories: string[] = [];
    const titles: string[] = [];
    const descriptions: string[] = [];
    for (const recommendation of recommendations) {
      for (const finding of recommendation.analysis?.findings ?? []) {
        recommendationIds.push(recommendation.id.value);
        ids.push(finding.id.value);
        categories.push(finding.category);
        titles.push(finding.title);
        descriptions.push(finding.description);
      }
    }
    return {
      tenantId,
      recommendationIds,
      ids,
      categories,
      titles,
      descriptions,
    };
  }
}
