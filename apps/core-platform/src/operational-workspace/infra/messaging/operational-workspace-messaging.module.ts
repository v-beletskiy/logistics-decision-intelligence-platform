import { Module } from '@nestjs/common';

import { OperationalWorkspaceAppModule } from '../../app/operational-workspace-app.module';

@Module({
  imports: [OperationalWorkspaceAppModule],
})
export class OperationalWorkspaceMessagingModule {}
