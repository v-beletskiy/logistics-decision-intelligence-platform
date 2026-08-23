import { Module } from "@nestjs/common";

import { RouteRepository } from "../../domain/route.repository";
import { RouteStopRepository } from "../../domain/route-stop.repository";
import { RouteReadStore } from "../../app/ports/route-read-store";
import { PgRouteReadStore } from "./read-store/pg-route.read-store";
import { PgRouteRepository } from "./repository/pg-route.repository";
import { PgRouteStopRepository } from "./repository/pg-route-stop.repository";

@Module({
  providers: [
    {
      provide: RouteRepository,
      useClass: PgRouteRepository,
    },
    {
      provide: RouteStopRepository,
      useClass: PgRouteStopRepository,
    },
    {
      provide: RouteReadStore,
      useClass: PgRouteReadStore,
    },
  ],
  exports: [RouteRepository, RouteStopRepository, RouteReadStore],
})
export class RoutePersistenceModule {}
