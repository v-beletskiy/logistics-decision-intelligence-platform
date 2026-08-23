import { Module } from "@nestjs/common";

import { GetRouteAnalysisContextHandler } from "../app/queries/get-route-analysis-context/get-route-analysis-context.handler";
import { RoutePersistenceModule } from "../infra/persistence/route-persistence.module";

@Module({
  imports: [RoutePersistenceModule],
  providers: [GetRouteAnalysisContextHandler],
  exports: [GetRouteAnalysisContextHandler],
})
export class RouteQueryModule {}
