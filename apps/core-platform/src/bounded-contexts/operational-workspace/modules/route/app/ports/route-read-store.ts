import type { RouteAnalysisContextResult } from "../queries/get-route-analysis-context/get-route-analysis-context.result";

/** Provides Route query projections without reconstituting Route aggregates. */
export abstract class RouteReadStore {
  abstract getAnalysisContext(
    tenantId: string,
    routeId: string,
  ): Promise<RouteAnalysisContextResult | null>;
}
