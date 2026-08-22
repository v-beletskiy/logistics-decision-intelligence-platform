import { Module } from "@nestjs/common";

import { DecisionIntelligenceWorkerModule } from "../bounded-contexts/decision-intelligence/infra/worker/decision-intelligence-worker.module";
import { AppConfigModule } from "../shared/infra/config/app-config.module";
import { IntegrationMessagingInfraModule } from "../shared/infra/messaging/integration/integration-messaging-infra.module";
import { InternalMessagingInfraModule } from "../shared/infra/messaging/internal/internal-messaging-infra.module";
import { PersistenceInfraModule } from "../shared/infra/persistence/persistence-infra.module";

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
