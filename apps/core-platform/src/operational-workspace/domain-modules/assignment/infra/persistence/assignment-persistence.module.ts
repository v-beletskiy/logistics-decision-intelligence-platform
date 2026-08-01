import { Module } from '@nestjs/common';

import { AssignmentRepository } from '../../domain/assignment.repository';
import { PgAssignmentRepository } from './assignment.pg-repository';

@Module({
  providers: [
    {
      provide: AssignmentRepository,
      useClass: PgAssignmentRepository,
    },
  ],
  exports: [AssignmentRepository],
})
export class AssignmentPersistenceModule {}
