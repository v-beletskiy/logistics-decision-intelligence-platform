import { Module } from "@nestjs/common";

import { AssignmentPersistenceModule } from "../../assignment/infra/persistence/assignment-persistence.module.js";
import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module.js";
import { CancelRouteHandler } from "../app/commands/cancel-route/cancel-route.handler.js";
import { CompleteRouteHandler } from "../app/commands/complete-route/complete-route.handler.js";
import { CreateRouteHandler } from "../app/commands/create-route/create-route.handler.js";
import { RecordRouteStopArrivalHandler } from "../app/commands/record-route-stop-arrival/record-route-stop-arrival.handler.js";
import { RecordRouteStopDepartureHandler } from "../app/commands/record-route-stop-departure/record-route-stop-departure.handler.js";
import { StartRouteStopHandler } from "../app/commands/start-route-stop/start-route-stop.handler.js";
import { StartRouteHandler } from "../app/commands/start-route/start-route.handler.js";
import { RoutePlanningPolicy } from "../domain/route-planning.policy.js";
import { RoutePersistenceModule } from "../infra/persistence/route-persistence.module.js";

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
