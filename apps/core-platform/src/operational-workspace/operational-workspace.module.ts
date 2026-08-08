import { Module } from "@nestjs/common";

import { OperationalWorkspaceAppModule } from "./app/operational-workspace-app.module";
import { OperationalWorkspaceHttpModule } from "./infra/http/operational-workspace-http.module";
import { OperationalWorkspaceMessagingModule } from "./infra/messaging/operational-workspace-messaging.module";

@Module({
  imports: [
    OperationalWorkspaceAppModule,
    OperationalWorkspaceHttpModule,
    OperationalWorkspaceMessagingModule,
  ],
})
export class OperationalWorkspaceModule {}
