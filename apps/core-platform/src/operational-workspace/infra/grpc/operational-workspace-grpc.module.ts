import { Module } from "@nestjs/common";

import { OperationalWorkspaceAppModule } from "../../app/operational-workspace-app.module";
import { RouteAnalysisGrpcController } from "../route/grpc/route-analysis.grpc-controller";

@Module({
  imports: [OperationalWorkspaceAppModule],
  providers: [RouteAnalysisGrpcController],
})
export class OperationalWorkspaceGrpcModule {}
