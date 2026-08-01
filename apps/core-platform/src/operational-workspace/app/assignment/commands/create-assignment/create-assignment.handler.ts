import { Injectable } from '@nestjs/common';

import { CreateAssignmentCommand } from './create-assignment.command';

@Injectable()
export class CreateAssignmentHandler {
  async execute(_command: CreateAssignmentCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
