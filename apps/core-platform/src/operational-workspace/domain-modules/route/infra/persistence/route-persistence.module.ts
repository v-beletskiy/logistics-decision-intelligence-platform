import { Module } from "@nestjs/common";

import { RouteRepository } from "../../domain/route.repository";
import { RouteStopRepository } from "../../domain/route-stop.repository";
import { PgRouteRepository } from "./repository/route.pg-repository";
import { PgRouteStopRepository } from "./repository/route-stop.pg-repository";

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
