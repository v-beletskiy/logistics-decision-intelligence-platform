import { Module } from "@nestjs/common";

import { OperationalWorkspaceGrpcModule } from "../infra/grpc/operational-workspace-grpc.module";
import { OperationalWorkspaceHttpModule } from "../infra/http/operational-workspace-http.module";

@Module({
  imports: [OperationalWorkspaceHttpModule, OperationalWorkspaceGrpcModule],
})
export class OperationalWorkspaceApiModule {}
