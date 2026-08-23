import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { RouteReadStore } from "../../../app/ports/route-read-store";
import type { RouteAnalysisContextResult } from "../../../app/queries/get-route-analysis-context/get-route-analysis-context.result";
import { RouteAnalysisContextMapper } from "./mappers/route-analysis-context.mapper";
import { findRouteAnalysisContextByRouteId } from "./queries/route-analysis-context.find-by-route-id.queries";

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
