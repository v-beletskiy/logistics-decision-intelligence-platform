import { Module } from "@nestjs/common";

import { AssignmentRepository } from "../../domain/assignment.repository.js";
import { PgAssignmentRepository } from "./repository/pg-assignment.repository.js";

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
