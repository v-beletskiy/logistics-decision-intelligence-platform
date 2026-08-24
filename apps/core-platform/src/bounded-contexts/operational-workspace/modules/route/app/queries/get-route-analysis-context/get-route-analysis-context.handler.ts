import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { RouteReadStore } from "../../ports/route-read-store.js";
import { GetRouteAnalysisContextQuery } from "./get-route-analysis-context.query.js";
import type { RouteAnalysisContextResult } from "./get-route-analysis-context.result.js";

@Injectable()
export class GetRouteAnalysisContextHandler {
  constructor(private readonly readStore: RouteReadStore) {}

  async exec(
    query: GetRouteAnalysisContextQuery,
  ): Promise<RouteAnalysisContextResult> {
    const context = await this.readStore.getAnalysisContext(
      query.tenantId,
      query.routeId,
    );
    if (!context) {
      throw new AggregateNotFoundException("Route");
    }
    return context;
  }
}
