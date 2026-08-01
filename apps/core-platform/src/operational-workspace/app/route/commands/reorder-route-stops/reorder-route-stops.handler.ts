import { Injectable } from '@nestjs/common';

import { ReorderRouteStopsCommand } from './reorder-route-stops.command';

@Injectable()
export class ReorderRouteStopsHandler {
  async execute(_command: ReorderRouteStopsCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
