import { Injectable } from '@nestjs/common';

import { SuspendDriverCommand } from './suspend-driver.command';

@Injectable()
export class SuspendDriverHandler {
  async execute(_command: SuspendDriverCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
