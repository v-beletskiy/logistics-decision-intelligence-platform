import { Injectable } from "@nestjs/common";

import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { RouteReadStore } from "../../ports/route-read-store";
import { GetRouteAnalysisContextQuery } from "./get-route-analysis-context.query";
import type { RouteAnalysisContextResult } from "./get-route-analysis-context.result";

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
