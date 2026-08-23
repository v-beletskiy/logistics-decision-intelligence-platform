import { Module } from "@nestjs/common";

import { RoutePlanningSnapshotQuery } from "../public-api/queries/route-planning-snapshot.query";
import { RoutePlanningSnapshotQueryAdapter } from "../modules/route/app/queries/route-planning-snapshot/route-planning-snapshot.query-adapter";
import { RouteQueryModule } from "../modules/route/composition/route-query.module";

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
