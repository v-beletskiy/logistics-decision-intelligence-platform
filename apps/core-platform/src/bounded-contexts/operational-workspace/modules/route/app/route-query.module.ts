import { Module } from "@nestjs/common";

import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module";
import { RoutePersistenceModule } from "../infra/persistence/route-persistence.module";
import { GetRouteAnalysisContextHandler } from "./queries/get-route-analysis-context/get-route-analysis-context.handler";

/** Owns Route read use cases without publishing them across bounded contexts. */
@Module({
  imports: [RoutePersistenceModule, ShipmentPersistenceModule],
  providers: [GetRouteAnalysisContextHandler],
  exports: [GetRouteAnalysisContextHandler],
})
export class RouteQueryModule {}
