import { Module } from "@nestjs/common";

import { HttpClient } from "../../../../../shared/infra/http/http-client.js";
import { FetchHttpClient } from "../../../../../shared/infra/http/http-client.js";
import { CostMatrixProvider } from "../app/ports/cost-matrix-provider.js";
import { RouteOptimizer } from "../app/ports/route-optimizer.js";
import { OsrmCostMatrixProvider } from "./cost-matrix/osrm-cost-matrix.provider.js";
import { VroomClient } from "./vroom/vroom-client.js";
import { VroomMapper } from "./vroom/vroom.mapper.js";
import { VroomRouteOptimizer } from "./vroom/vroom-route-optimizer.js";

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
