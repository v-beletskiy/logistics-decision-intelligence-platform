import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import {
  RecommendationReadStore,
  type RecommendationListItem,
} from "../../../app/ports/recommendation-read-store.js";
import { RecommendationReadMapper } from "./mappers/recommendation-read.mapper.js";
import { listRecommendationsByRouteId } from "./queries/recommendation.list-by-route-id.queries.js";

@Injectable()
export class PgRecommendationReadStore extends RecommendationReadStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async listByRouteId(
    tenantId: string,
    routeId: string,
  ): Promise<readonly RecommendationListItem[]> {
    const rows = await this.database.exec(listRecommendationsByRouteId, {
      tenantId,
      routeId,
    });
    return RecommendationReadMapper.toListItems(rows);
  }
}
