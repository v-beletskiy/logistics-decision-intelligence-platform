import { Injectable } from '@nestjs/common';

import { CreateShipmentCommand } from './create-shipment.command';

@Injectable()
export class CreateShipmentHandler {
  async execute(_command: CreateShipmentCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
