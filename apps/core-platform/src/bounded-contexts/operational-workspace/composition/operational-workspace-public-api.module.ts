import { Module } from "@nestjs/common";

import { RoutePlanningSnapshotQuery } from "../public-api/queries/route-planning-snapshot.query.js";
import { RoutePlanningSnapshotHandler } from "../modules/route/app/queries/route-planning-snapshot/route-planning-snapshot.handler.js";
import { RouteQueryModule } from "../modules/route/composition/route-query.module.js";

@Module({
  imports: [RouteQueryModule],
  providers: [
    {
      provide: RoutePlanningSnapshotQuery,
      useClass: RoutePlanningSnapshotHandler,
    },
  ],
  exports: [RoutePlanningSnapshotQuery],
})
export class OperationalWorkspacePublicApiModule {}
