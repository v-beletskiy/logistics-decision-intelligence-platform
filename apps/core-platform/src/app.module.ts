import { Module } from '@nestjs/common';

import { AdministrationModule } from './administration/administration.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DecisionIntelligenceModule } from './decision-intelligence/decision-intelligence.module';
import { DeveloperPlatformModule } from './developer-platform/developer-platform.module';
import { IntegrationHubModule } from './integration-hub/integration-hub.module';
import { OperationalWorkspaceModule } from './operational-workspace/operational-workspace.module';
import { AccessControlModule } from './shared/access-control/access-control.module';
import { ConfigModule } from './shared/infra/config/config.module';
import { InfraModule } from './shared/infra/infra.module';

@Module({
  imports: [
    ConfigModule,
    InfraModule,
    AccessControlModule,
    IntegrationHubModule,
    OperationalWorkspaceModule,
    DecisionIntelligenceModule,
    AnalyticsModule,
    DeveloperPlatformModule,
    AdministrationModule,
  ],
})
export class AppModule {}
