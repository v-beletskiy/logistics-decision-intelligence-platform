import { Module } from "@nestjs/common";

import { DecisionIntelligenceWorkerModule } from "../bounded-contexts/decision-intelligence/composition/decision-intelligence-worker.module.js";
import { AppConfigModule } from "../shared/infra/config/app-config.module.js";
import { IntegrationMessagingInfraModule } from "../shared/infra/messaging/integration/integration-messaging-infra.module.js";
import { InternalMessagingInfraModule } from "../shared/infra/messaging/internal/internal-messaging-infra.module.js";
import { PersistenceInfraModule } from "../shared/infra/persistence/persistence-infra.module.js";

@Module({
  imports: [
    AppConfigModule,
    PersistenceInfraModule,
    InternalMessagingInfraModule,
    IntegrationMessagingInfraModule.register("worker"),
    DecisionIntelligenceWorkerModule,
  ],
})
export class WorkerCompositionModule {}
