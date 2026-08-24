import { Module } from "@nestjs/common";

import { RoutePlanningSnapshotQuery } from "../public-api/queries/route-planning-snapshot.query.js";
import { RoutePlanningSnapshotQueryAdapter } from "../modules/route/app/queries/route-planning-snapshot/route-planning-snapshot.query-adapter.js";
import { RouteQueryModule } from "../modules/route/composition/route-query.module.js";

@Module({
  imports: [RouteQueryModule],
  providers: [
    {
      provide: RoutePlanningSnapshotQuery,
      useClass: RoutePlanningSnapshotQueryAdapter,
    },
  ],
  exports: [RoutePlanningSnapshotQuery],
})
export class OperationalWorkspacePublicApiModule {}
