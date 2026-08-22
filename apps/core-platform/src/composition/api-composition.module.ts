import { Module } from "@nestjs/common";

import { AdministrationModule } from "../bounded-contexts/administration/administration.module";
import { DecisionIntelligenceModule } from "../bounded-contexts/decision-intelligence/decision-intelligence.module";
import { OperationalWorkspaceModule } from "../bounded-contexts/operational-workspace/operational-workspace.module";
import { AccessControlModule } from "../shared/modules/access-control/access-control.module";
import { AppConfigModule } from "../shared/infra/config/app-config.module";
import { GrpcInfraModule } from "../shared/infra/grpc/grpc-infra.module";
import { HttpInfraModule } from "../shared/infra/http/http-infra.module";
import { IntegrationMessagingInfraModule } from "../shared/infra/messaging/integration/integration-messaging-infra.module";
import { InternalMessagingInfraModule } from "../shared/infra/messaging/internal/internal-messaging-infra.module";
import { PersistenceInfraModule } from "../shared/infra/persistence/persistence-infra.module";

@Module({
  imports: [
    AppConfigModule,
    PersistenceInfraModule,
    InternalMessagingInfraModule,
    IntegrationMessagingInfraModule.register("api"),
    HttpInfraModule,
    GrpcInfraModule,
    AccessControlModule,
    OperationalWorkspaceModule,
    DecisionIntelligenceModule,
    AdministrationModule,
  ],
})
export class ApiCompositionModule {}
