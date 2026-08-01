import { Injectable } from '@nestjs/common';

import { ReassignDriverCommand } from './reassign-driver.command';

@Injectable()
export class ReassignDriverHandler {
  async execute(_command: ReassignDriverCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
