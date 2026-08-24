import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { RouteReadStore } from "../../../app/ports/route-read-store.js";
import type { RouteAnalysisContextResult } from "../../../app/queries/get-route-analysis-context/get-route-analysis-context.result.js";
import { RouteAnalysisContextMapper } from "./mappers/route-analysis-context.mapper.js";
import { findRouteAnalysisContextByRouteId } from "./queries/route-analysis-context.find-by-route-id.queries.js";

@Injectable()
export class PgRouteReadStore extends RouteReadStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async getAnalysisContext(
    tenantId: string,
    routeId: string,
  ): Promise<RouteAnalysisContextResult | null> {
    const rows = await this.database.exec(findRouteAnalysisContextByRouteId, {
      tenantId,
      routeId,
    });
    return RouteAnalysisContextMapper.toResult(rows);
  }
}
