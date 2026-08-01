import { Injectable } from '@nestjs/common';

import { CreateRouteCommand } from './create-route.command';

@Injectable()
export class CreateRouteHandler {
  async execute(_command: CreateRouteCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
