import { Module } from "@nestjs/common";

import { HttpClient } from "../../../../../shared/infra/http/http-client";
import { FetchHttpClient } from "../../../../../shared/infra/http/http-client";
import { CostMatrixProvider } from "../app/ports/cost-matrix-provider";
import { RouteOptimizer } from "../app/ports/route-optimizer";
import { OsrmCostMatrixProvider } from "./cost-matrix/osrm-cost-matrix.provider";
import { VroomClient } from "./vroom/vroom-client";
import { VroomMapper } from "./vroom/vroom.mapper";
import { VroomRouteOptimizer } from "./vroom/vroom-route-optimizer";

@Module({
  providers: [
    {
      provide: HttpClient,
      useClass: FetchHttpClient,
    },
    VroomClient,
    VroomMapper,
    {
      provide: CostMatrixProvider,
      useClass: OsrmCostMatrixProvider,
    },
    {
      provide: RouteOptimizer,
      useClass: VroomRouteOptimizer,
    },
  ],
  exports: [CostMatrixProvider, RouteOptimizer],
})
export class OptimizationInfraModule {}
