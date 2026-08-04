import { Module } from "@nestjs/common";

import { CreateRouteHandler } from "./commands/create-route/create-route.handler";
import { StartRouteHandler } from "./commands/start-route/start-route.handler";
import { CompleteRouteHandler } from "./commands/complete-route/complete-route.handler";
import { CancelRouteHandler } from "./commands/cancel-route/cancel-route.handler";
import { RoutePersistenceModule } from "../../domain-modules/route/infra/persistence/route-persistence.module";
import { ShipmentPersistenceModule } from "../../domain-modules/shipment/infra/persistence/shipment-persistence.module";
import { AssignmentPersistenceModule } from "../../domain-modules/assignment/infra/persistence/assignment-persistence.module";

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
  ],
  exports: [
    CreateRouteHandler,
    StartRouteHandler,
    CompleteRouteHandler,
    CancelRouteHandler,
  ],
})
export class RouteAppModule {}
