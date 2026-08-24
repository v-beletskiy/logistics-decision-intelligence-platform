import type { RouteReference } from "../../../domain/route-reference.js";
import type { Recommendation } from "./recommendation.aggregate.js";
import type { RecommendationId } from "./recommendation-id.js";

export interface LoadedRecommendation {
  readonly aggregate: Recommendation;
  readonly expectedRevision: string;
}

export abstract class RecommendationRepository {
  abstract findById(
    tenantId: string,
    id: RecommendationId,
  ): Promise<LoadedRecommendation | null>;
  abstract findPendingByRouteId(
    tenantId: string,
    routeId: RouteReference,
  ): Promise<readonly Recommendation[]>;
  abstract findPending(
    tenantId: string,
    limit?: number,
  ): Promise<readonly Recommendation[]>;
  abstract add(tenantId: string, recommendation: Recommendation): Promise<void>;
  abstract addMany(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void>;
  abstract save(
    tenantId: string,
    loadedRecommendation: LoadedRecommendation,
  ): Promise<string>;
  abstract delete(tenantId: string, id: RecommendationId): Promise<void>;
}
