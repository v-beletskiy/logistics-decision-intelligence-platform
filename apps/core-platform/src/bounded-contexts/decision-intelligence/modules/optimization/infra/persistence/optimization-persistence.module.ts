import { Module } from "@nestjs/common";

import { OptimizationRepository } from "../../domain/optimization.repository.js";
import { PgOptimizationRepository } from "./repository/pg-optimization.repository.js";

@Module({
  providers: [
    {
      provide: OptimizationRepository,
      useClass: PgOptimizationRepository,
    },
  ],
  exports: [OptimizationRepository],
})
export class OptimizationPersistenceModule {}
