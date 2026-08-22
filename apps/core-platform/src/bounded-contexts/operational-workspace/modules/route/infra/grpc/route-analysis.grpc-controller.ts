import { Injectable, type OnModuleInit } from "@nestjs/common";

import {
  RouteAnalysisServiceService,
  type RouteAnalysisServiceServer,
} from "../../../../../../shared/infra/grpc/generated/operational_workspace/v1/route_analysis_service";
import { GrpcServiceRegistry } from "../../../../../../shared/infra/grpc/grpc-service-registry";
import { GetRouteAnalysisContextHandler } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.handler";
import { GetRouteAnalysisContextQuery } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.query";
import { RouteAnalysisGrpcMapper } from "./route-analysis.grpc-mapper";

/** Maps the RouteAnalysisService boundary to the Operational Workspace read model. */
@Injectable()
export class RouteAnalysisGrpcController implements OnModuleInit {
  constructor(
    private readonly getRouteAnalysisContextHandler: GetRouteAnalysisContextHandler,
    private readonly registry: GrpcServiceRegistry,
  ) {}

  readonly handlers: RouteAnalysisServiceServer = {
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
    this.registry.register(RouteAnalysisServiceService, this.handlers);
  }
}
