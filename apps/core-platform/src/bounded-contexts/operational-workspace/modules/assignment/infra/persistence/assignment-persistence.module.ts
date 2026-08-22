import { Module } from "@nestjs/common";

import { AssignmentRepository } from "../../domain/assignment.repository";
import { PgAssignmentRepository } from "./repository/pg-assignment.repository";

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
