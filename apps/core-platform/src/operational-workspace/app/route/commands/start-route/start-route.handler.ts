import { Injectable } from '@nestjs/common';

import { StartRouteCommand } from './start-route.command';

@Injectable()
export class StartRouteHandler {
  async execute(_command: StartRouteCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
