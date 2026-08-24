import { Injectable, type OnModuleInit } from "@nestjs/common";

import {
  RouteAnalysisService,
  type RouteAnalysisServer,
} from "../../../../../../shared/infra/grpc/generated/operational_workspace/v1/route_analysis_service.js";
import { GrpcServiceRegistry } from "../../../../../../shared/infra/grpc/grpc-service-registry.js";
import { GetRouteAnalysisContextHandler } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.handler.js";
import { GetRouteAnalysisContextQuery } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.query.js";
import { RouteAnalysisGrpcMapper } from "./route-analysis.grpc-mapper.js";

/** Maps the RouteAnalysis boundary to the Operational Workspace read model. */
@Injectable()
export class RouteAnalysisGrpcController implements OnModuleInit {
  constructor(
    private readonly getRouteAnalysisContextHandler: GetRouteAnalysisContextHandler,
    private readonly registry: GrpcServiceRegistry,
  ) {}

  readonly handlers: RouteAnalysisServer = {
    getRouteAnalysisContext: async (call, callback) => {
      const context = await this.getRouteAnalysisContextHandler.exec(
        new GetRouteAnalysisContextQuery(
          call.request.tenantId,
          call.request.routeId,
        ),
      );
      callback(null, {
        context: RouteAnalysisGrpcMapper.toRouteAnalysisContext(context),
      });
    },
  };

  onModuleInit(): void {
    this.registry.register(RouteAnalysisService, this.handlers);
  }
}
