import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import type { RouteReference } from "../../../../../domain/route-reference";
import type { Recommendation } from "../../../domain/recommendation.aggregate";
import { RecommendationId } from "../../../domain/recommendation-id";
import { RecommendationRepository } from "../../../domain/recommendation.repository";
import { RecommendationMapper } from "./mappers/recommendation.mapper";
import { deleteRecommendation } from "./queries/recommendation.delete.queries";
import { findRecommendationById } from "./queries/recommendation.find-by-id.queries";
import { findRecommendationsPendingByRouteId } from "./queries/recommendation.find-pending-by-route-id.queries";
import { findRecommendationsPending } from "./queries/recommendation.find-pending.queries";
import { reconcileRecommendationFacts } from "./queries/recommendation.reconcile-facts.queries";
import { reconcileRecommendationFindings } from "./queries/recommendation.reconcile-findings.queries";
import { saveRecommendation } from "./queries/recommendation.save.queries";
import { saveRecommendations } from "./queries/recommendation.save-many.queries";

@Injectable()
export class PgRecommendationRepository extends RecommendationRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: RecommendationId,
  ): Promise<Recommendation | null> {
    const [row] = await this.database.exec(findRecommendationById, {
      tenantId,
      id: id.value,
    });
    return row ? RecommendationMapper.toDomain(row) : null;
  }

  async findPendingByRouteId(
    tenantId: string,
    routeId: RouteReference,
  ): Promise<readonly Recommendation[]> {
    const rows = await this.database.exec(findRecommendationsPendingByRouteId, {
      tenantId,
      routeId: routeId.value,
    });
    return rows.map(RecommendationMapper.toDomain);
  }

  async findPending(
    tenantId: string,
    limit = 10,
  ): Promise<readonly Recommendation[]> {
    const rows = await this.database.exec(findRecommendationsPending, {
      tenantId,
      limit,
    });
    return rows.map(RecommendationMapper.toDomain);
  }

  async save(tenantId: string, recommendation: Recommendation): Promise<void> {
    await this.database.runInTransaction(async () => {
      await this.database.exec(
        saveRecommendation,
        RecommendationMapper.toPersistence(tenantId, recommendation),
      );
      await this.database.exec(
        reconcileRecommendationFacts,
        RecommendationMapper.toReconcileFactsParams(tenantId, [recommendation]),
      );
      await this.database.exec(
        reconcileRecommendationFindings,
        RecommendationMapper.toReconcileFindingsParams(tenantId, [
          recommendation,
        ]),
      );
    });
  }

  async saveMany(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void> {
    if (recommendations.length === 0) return;
    await this.database.runInTransaction(async () => {
      await this.database.exec(
        saveRecommendations,
        RecommendationMapper.toSaveManyPersistence(tenantId, recommendations),
      );
      await this.database.exec(
        reconcileRecommendationFacts,
        RecommendationMapper.toReconcileFactsParams(tenantId, recommendations),
      );
      await this.database.exec(
        reconcileRecommendationFindings,
        RecommendationMapper.toReconcileFindingsParams(
          tenantId,
          recommendations,
        ),
      );
    });
  }

  async delete(tenantId: string, id: RecommendationId): Promise<void> {
    await this.database.exec(deleteRecommendation, { tenantId, id: id.value });
  }
}
