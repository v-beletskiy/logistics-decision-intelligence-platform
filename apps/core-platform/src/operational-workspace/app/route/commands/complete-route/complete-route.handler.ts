import { Injectable } from '@nestjs/common';

import { CompleteRouteCommand } from './complete-route.command';

@Injectable()
export class CompleteRouteHandler {
  async execute(_command: CompleteRouteCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
