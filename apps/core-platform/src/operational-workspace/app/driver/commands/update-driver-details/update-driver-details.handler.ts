import { Injectable } from '@nestjs/common';

import { UpdateDriverDetailsCommand } from './update-driver-details.command';

@Injectable()
export class UpdateDriverDetailsHandler {
  async execute(_command: UpdateDriverDetailsCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
