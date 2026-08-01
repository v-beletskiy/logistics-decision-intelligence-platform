import { Injectable } from '@nestjs/common';

import { CancelShipmentCommand } from './cancel-shipment.command';

@Injectable()
export class CancelShipmentHandler {
  async execute(_command: CancelShipmentCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
