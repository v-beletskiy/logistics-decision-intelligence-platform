import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import type {
  RecommendationFindingListItem,
  RecommendationListItem,
} from "../../../../app/ports/recommendation-read-store.js";
import type { IListRecommendationsByRouteIdResult } from "../queries/recommendation.list-by-route-id.queries.js";

/** Maps PostgreSQL recommendation projections to application read models. */
export class RecommendationReadMapper {
  static toListItems(
    rows: readonly IListRecommendationsByRouteIdResult[],
  ): readonly RecommendationListItem[] {
    return rows.map((row) => this.toListItem(row));
  }

  private static toListItem(
    row: IListRecommendationsByRouteIdResult,
  ): RecommendationListItem {
    return hydratePersistenceData("recommendation read model", () => ({
      id: row.id,
      optimizationId: row.optimization_id,
      type: row.type as RecommendationListItem["type"],
      status: row.status as RecommendationListItem["status"],
      score: row.score,
      proposedRouteStopIds:
        row.proposed_route_stop_ids as unknown as readonly string[],
      facts: row.facts as unknown as RecommendationListItem["facts"],
      analysisStatus:
        row.analysis_status as RecommendationListItem["analysisStatus"],
      analysis:
        row.summary === null || row.confidence === null
          ? undefined
          : {
              summary: row.summary,
              confidence: row.confidence,
              findings:
                row.findings as unknown as readonly RecommendationFindingListItem[],
            },
    }));
  }
}
