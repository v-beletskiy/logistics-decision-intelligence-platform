import { Module } from "@nestjs/common";

import { OperationalWorkspaceAppModule } from "./app/operational-workspace-app.module";
import { OperationalWorkspaceHttpModule } from "./infra/http/operational-workspace-http.module";
import { OperationalWorkspaceGrpcModule } from "./infra/grpc/operational-workspace-grpc.module";

@Module({
  imports: [
    OperationalWorkspaceAppModule,
    OperationalWorkspaceHttpModule,
    OperationalWorkspaceGrpcModule,
  ],
})
export class OperationalWorkspaceModule {}
