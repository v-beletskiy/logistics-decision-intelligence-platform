import { Module } from "@nestjs/common";

import { GetRouteAnalysisContextHandler } from "../app/queries/get-route-analysis-context/get-route-analysis-context.handler.js";
import { RoutePersistenceModule } from "../infra/persistence/route-persistence.module.js";

@Module({
  imports: [RoutePersistenceModule],
  providers: [GetRouteAnalysisContextHandler],
  exports: [GetRouteAnalysisContextHandler],
})
export class RouteQueryModule {}
