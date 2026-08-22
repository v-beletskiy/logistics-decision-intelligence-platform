import { Module } from "@nestjs/common";

import { RouteRepository } from "../../domain/route.repository";
import { RouteStopRepository } from "../../domain/route-stop.repository";
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
  ],
  exports: [RouteRepository, RouteStopRepository],
})
export class RoutePersistenceModule {}
