import { Module } from "@nestjs/common";

import { OperationalWorkspaceGrpcModule } from "../infra/grpc/operational-workspace-grpc.module.js";
import { OperationalWorkspaceHttpModule } from "../infra/http/operational-workspace-http.module.js";

@Module({
  imports: [OperationalWorkspaceHttpModule, OperationalWorkspaceGrpcModule],
})
export class OperationalWorkspaceApiModule {}
