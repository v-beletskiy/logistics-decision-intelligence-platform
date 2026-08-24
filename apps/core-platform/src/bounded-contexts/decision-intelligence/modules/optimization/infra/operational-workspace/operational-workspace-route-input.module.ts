import { Module } from "@nestjs/common";

import { OperationalWorkspacePublicApiModule } from "../../../../../operational-workspace/composition/operational-workspace-public-api.module.js";
import { RouteOptimizationInputQuery } from "../../app/ports/route-optimization-input.query.js";
import { RouteOptimizationInputQueryAdapter } from "./route-optimization-input.query-adapter.js";

@Module({
  imports: [OperationalWorkspacePublicApiModule],
  providers: [
    {
      provide: RouteOptimizationInputQuery,
      useClass: RouteOptimizationInputQueryAdapter,
    },
  ],
  exports: [RouteOptimizationInputQuery],
})
export class OperationalWorkspaceRouteInputModule {}
