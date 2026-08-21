import { Module } from "@nestjs/common";

import { CreateRouteHandler } from "./commands/create-route/create-route.handler";
import { StartRouteHandler } from "./commands/start-route/start-route.handler";
import { CompleteRouteHandler } from "./commands/complete-route/complete-route.handler";
import { CancelRouteHandler } from "./commands/cancel-route/cancel-route.handler";
import { StartRouteStopHandler } from "./commands/start-route-stop/start-route-stop.handler";
import { RecordRouteStopArrivalHandler } from "./commands/record-route-stop-arrival/record-route-stop-arrival.handler";
import { RecordRouteStopDepartureHandler } from "./commands/record-route-stop-departure/record-route-stop-departure.handler";
import { GetRouteAnalysisContextHandler } from "./queries/get-route-analysis-context/get-route-analysis-context.handler";
import { RouteOptimizationInputReadContract } from "../../contracts/reads/route-optimization-input.read-contract";
import { RouteOptimizationInputReadContractProvider } from "../../infra/route/persistence/route-optimization-input.read-contract.provider";
import { RoutePersistenceModule } from "../../domain-modules/route/infra/persistence/route-persistence.module";
import { ShipmentPersistenceModule } from "../../domain-modules/shipment/infra/persistence/shipment-persistence.module";
import { AssignmentPersistenceModule } from "../../domain-modules/assignment/infra/persistence/assignment-persistence.module";
import { RoutePlanningPolicy } from "../../domain-modules/route/domain/policies/route-planning.policy";

@Module({
  imports: [
    RoutePersistenceModule,
    ShipmentPersistenceModule,
    AssignmentPersistenceModule,
  ],
  providers: [
    CreateRouteHandler,
    StartRouteHandler,
    CompleteRouteHandler,
    CancelRouteHandler,
    StartRouteStopHandler,
    RecordRouteStopArrivalHandler,
    RecordRouteStopDepartureHandler,
    GetRouteAnalysisContextHandler,
    RoutePlanningPolicy,
    {
      provide: RouteOptimizationInputReadContract,
      useClass: RouteOptimizationInputReadContractProvider,
    },
  ],
  exports: [
    CreateRouteHandler,
    StartRouteHandler,
    CompleteRouteHandler,
    CancelRouteHandler,
    StartRouteStopHandler,
    RecordRouteStopArrivalHandler,
    RecordRouteStopDepartureHandler,
    GetRouteAnalysisContextHandler,
    RouteOptimizationInputReadContract,
  ],
})
export class RouteAppModule {}
