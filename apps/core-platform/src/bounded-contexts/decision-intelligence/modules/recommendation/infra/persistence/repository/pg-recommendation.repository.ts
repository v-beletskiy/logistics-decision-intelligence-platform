import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { execRevisionedPgUpdate } from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import type { RouteReference } from "../../../../../domain/route-reference.js";
import type { Recommendation } from "../../../domain/recommendation.aggregate.js";
import { RecommendationId } from "../../../domain/recommendation-id.js";
import {
  RecommendationRepository,
  type LoadedRecommendation,
} from "../../../domain/recommendation.repository.js";
import { RecommendationMapper } from "./mappers/recommendation.mapper.js";
import { deleteRecommendation } from "./queries/recommendation.delete.queries.js";
import { findRecommendationById } from "./queries/recommendation.find-by-id.queries.js";
import { findRecommendationsPendingByRouteId } from "./queries/recommendation.find-pending-by-route-id.queries.js";
import { findRecommendationsPending } from "./queries/recommendation.find-pending.queries.js";
import { reconcileRecommendationFacts } from "./queries/recommendation.reconcile-facts.queries.js";
import { reconcileRecommendationFindings } from "./queries/recommendation.reconcile-findings.queries.js";
import { addRecommendation } from "./queries/recommendation.add.queries.js";
import { addRecommendations } from "./queries/recommendation.add-many.queries.js";
import { updateRecommendation } from "./queries/recommendation.update.queries.js";
import { addRecommendationRoutePlanStops } from "./queries/recommendation.add-route-plan-stops.queries.js";

@Injectable()
export class PgRecommendationRepository extends RecommendationRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: RecommendationId,
  ): Promise<LoadedRecommendation | null> {
    const [row] = await this.database.exec(findRecommendationById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: RecommendationMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
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

  async add(tenantId: string, recommendation: Recommendation): Promise<void> {
    await this.database.exec(
      addRecommendation,
      RecommendationMapper.toPersistence(tenantId, recommendation),
    );
    await this.addRoutePlanStops(tenantId, [recommendation]);
    await this.reconcileChildren(tenantId, [recommendation]);
  }

  async addMany(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void> {
    if (recommendations.length === 0) return;
    await this.database.exec(
      addRecommendations,
      RecommendationMapper.toAddManyPersistence(tenantId, recommendations),
    );
    await this.addRoutePlanStops(tenantId, recommendations);
    await this.reconcileChildren(tenantId, recommendations);
  }

  async save(
    tenantId: string,
    loadedRecommendation: LoadedRecommendation,
  ): Promise<string> {
    const revision = await execRevisionedPgUpdate({
      database: this.database,
      statement: updateRecommendation,
      params: {
        ...RecommendationMapper.toPersistence(
          tenantId,
          loadedRecommendation.aggregate,
        ),
        expectedRevision: loadedRecommendation.expectedRevision,
      },
      options: { aggregateName: "Recommendation" },
    });
    await this.reconcileChildren(tenantId, [loadedRecommendation.aggregate]);
    return revision;
  }

  async delete(tenantId: string, id: RecommendationId): Promise<void> {
    await this.database.exec(deleteRecommendation, { tenantId, id: id.value });
  }

  private async reconcileChildren(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void> {
    await this.database.exec(
      reconcileRecommendationFacts,
      RecommendationMapper.toReconcileFactsParams(tenantId, recommendations),
    );
    await this.database.exec(
      reconcileRecommendationFindings,
      RecommendationMapper.toReconcileFindingsParams(tenantId, recommendations),
    );
  }

  private async addRoutePlanStops(
    tenantId: string,
    recommendations: readonly Recommendation[],
  ): Promise<void> {
    const params = RecommendationMapper.toAddRoutePlanStopsParams(
      tenantId,
      recommendations,
    );
    if (params) {
      await this.database.exec(addRecommendationRoutePlanStops, params);
    }
  }
}
