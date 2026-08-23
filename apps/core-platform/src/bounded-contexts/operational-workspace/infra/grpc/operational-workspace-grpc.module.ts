import { Module } from "@nestjs/common";

import { RouteQueryModule } from "../../modules/route/composition/route-query.module";
import { RouteAnalysisGrpcController } from "../../modules/route/infra/grpc/route-analysis.grpc-controller";

@Module({
  imports: [RouteQueryModule],
  providers: [RouteAnalysisGrpcController],
})
export class OperationalWorkspaceGrpcModule {}
