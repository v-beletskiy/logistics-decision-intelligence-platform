import type { RouteReference } from "../../../domain/route-reference";
import type { Recommendation } from "./recommendation.aggregate";
import type { RecommendationId } from "./recommendation-id";

export abstract class RecommendationRepository {
  abstract findById(
    tenantId: string,
    id: RecommendationId,
  ): Promise<Recommendation | null>;
  abstract findPendingByRouteId(
    tenantId: string,
    routeId: RouteReference,
  ): Promise<readonly Recommendation[]>;
  abstract findPending(
    tenantId: string,
    limit?: number,
  ): Promise<readonly Recommendation[]>;
  abstract save(
    tenantId: string,
    recommendation: Recommendation,
  ): Promise<void>;
  abstract saveMany(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void>;
  abstract delete(tenantId: string, id: RecommendationId): Promise<void>;
}
