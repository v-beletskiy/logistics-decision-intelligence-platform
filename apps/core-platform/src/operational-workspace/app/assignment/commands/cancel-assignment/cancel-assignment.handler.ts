import { Injectable } from '@nestjs/common';

import { CancelAssignmentCommand } from './cancel-assignment.command';

@Injectable()
export class CancelAssignmentHandler {
  async execute(_command: CancelAssignmentCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
