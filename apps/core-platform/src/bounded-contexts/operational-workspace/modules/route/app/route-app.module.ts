import { Module } from "@nestjs/common";

import { CreateRouteHandler } from "./commands/create-route/create-route.handler";
import { StartRouteHandler } from "./commands/start-route/start-route.handler";
import { CompleteRouteHandler } from "./commands/complete-route/complete-route.handler";
import { CancelRouteHandler } from "./commands/cancel-route/cancel-route.handler";
import { StartRouteStopHandler } from "./commands/start-route-stop/start-route-stop.handler";
import { RecordRouteStopArrivalHandler } from "./commands/record-route-stop-arrival/record-route-stop-arrival.handler";
import { RecordRouteStopDepartureHandler } from "./commands/record-route-stop-departure/record-route-stop-departure.handler";
import { RoutePersistenceModule } from "../infra/persistence/route-persistence.module";
import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module";
import { AssignmentPersistenceModule } from "../../assignment/infra/persistence/assignment-persistence.module";
import { RoutePlanningPolicy } from "../domain/route-planning.policy";
import { OperationalWorkspacePublicApiModule } from "../../../composition/operational-workspace-public-api.module";
import { RouteQueryModule } from "./route-query.module";

@Module({
  imports: [
    RoutePersistenceModule,
    ShipmentPersistenceModule,
    AssignmentPersistenceModule,
    RouteQueryModule,
    OperationalWorkspacePublicApiModule,
  ],
  providers: [
    CreateRouteHandler,
    StartRouteHandler,
    CompleteRouteHandler,
    CancelRouteHandler,
    StartRouteStopHandler,
    RecordRouteStopArrivalHandler,
    RecordRouteStopDepartureHandler,
    RoutePlanningPolicy,
  ],
  exports: [
    CreateRouteHandler,
    StartRouteHandler,
    CompleteRouteHandler,
    CancelRouteHandler,
    StartRouteStopHandler,
    RecordRouteStopArrivalHandler,
    RecordRouteStopDepartureHandler,
    RouteQueryModule,
    OperationalWorkspacePublicApiModule,
  ],
})
export class RouteAppModule {}
