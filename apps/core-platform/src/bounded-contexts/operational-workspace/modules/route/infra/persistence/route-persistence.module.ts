import { Module } from "@nestjs/common";

import { RouteRepository } from "../../domain/route.repository.js";
import { RouteStopRepository } from "../../domain/route-stop.repository.js";
import { RouteReadStore } from "../../app/ports/route-read-store.js";
import { PgRouteReadStore } from "./read-store/pg-route.read-store.js";
import { PgRouteRepository } from "./repository/pg-route.repository.js";
import { PgRouteStopRepository } from "./repository/pg-route-stop.repository.js";

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
