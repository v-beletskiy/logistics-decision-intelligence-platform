import { Injectable } from '@nestjs/common';

import { StartAssignmentCommand } from './start-assignment.command';

@Injectable()
export class StartAssignmentHandler {
  async execute(_command: StartAssignmentCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
