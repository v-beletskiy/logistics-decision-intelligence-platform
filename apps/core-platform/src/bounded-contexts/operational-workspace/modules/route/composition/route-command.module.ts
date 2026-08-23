import { Module } from "@nestjs/common";

import { AssignmentPersistenceModule } from "../../assignment/infra/persistence/assignment-persistence.module";
import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module";
import { CancelRouteHandler } from "../app/commands/cancel-route/cancel-route.handler";
import { CompleteRouteHandler } from "../app/commands/complete-route/complete-route.handler";
import { CreateRouteHandler } from "../app/commands/create-route/create-route.handler";
import { RecordRouteStopArrivalHandler } from "../app/commands/record-route-stop-arrival/record-route-stop-arrival.handler";
import { RecordRouteStopDepartureHandler } from "../app/commands/record-route-stop-departure/record-route-stop-departure.handler";
import { StartRouteStopHandler } from "../app/commands/start-route-stop/start-route-stop.handler";
import { StartRouteHandler } from "../app/commands/start-route/start-route.handler";
import { RoutePlanningPolicy } from "../domain/route-planning.policy";
import { RoutePersistenceModule } from "../infra/persistence/route-persistence.module";

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
  ],
})
export class RouteCommandModule {}
