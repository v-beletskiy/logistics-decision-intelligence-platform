import { Injectable } from '@nestjs/common';

import { CompleteAssignmentCommand } from './complete-assignment.command';

@Injectable()
export class CompleteAssignmentHandler {
  async execute(_command: CompleteAssignmentCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
