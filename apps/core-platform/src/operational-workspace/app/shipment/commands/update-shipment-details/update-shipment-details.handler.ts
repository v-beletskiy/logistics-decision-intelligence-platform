import { Injectable } from '@nestjs/common';

import { UpdateShipmentDetailsCommand } from './update-shipment-details.command';

@Injectable()
export class UpdateShipmentDetailsHandler {
  async execute(_command: UpdateShipmentDetailsCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
