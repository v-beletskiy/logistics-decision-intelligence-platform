import { Injectable } from '@nestjs/common';

import { ReinstateDriverCommand } from './reinstate-driver.command';

@Injectable()
export class ReinstateDriverHandler {
  async execute(_command: ReinstateDriverCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
