import { Module } from "@nestjs/common";

import { AdministrationApiModule } from "../bounded-contexts/administration/composition/administration-api.module.js";
import { DecisionIntelligenceApiModule } from "../bounded-contexts/decision-intelligence/composition/decision-intelligence-api.module.js";
import { OperationalWorkspaceApiModule } from "../bounded-contexts/operational-workspace/composition/operational-workspace-api.module.js";
import { AccessControlModule } from "../shared/modules/access-control/access-control.module.js";
import { AppConfigModule } from "../shared/infra/config/app-config.module.js";
import { GrpcInfraModule } from "../shared/infra/grpc/grpc-infra.module.js";
import { HttpInfraModule } from "../shared/infra/http/http-infra.module.js";
import { IntegrationMessagingInfraModule } from "../shared/infra/messaging/integration/integration-messaging-infra.module.js";
import { InternalMessagingInfraModule } from "../shared/infra/messaging/internal/internal-messaging-infra.module.js";
import { PersistenceInfraModule } from "../shared/infra/persistence/persistence-infra.module.js";

@Module({
  imports: [
    AppConfigModule,
    PersistenceInfraModule,
    InternalMessagingInfraModule,
    IntegrationMessagingInfraModule.register("api"),
    HttpInfraModule,
    GrpcInfraModule,
    AccessControlModule,
    OperationalWorkspaceApiModule,
    DecisionIntelligenceApiModule,
    AdministrationApiModule,
  ],
})
export class ApiCompositionModule {}
