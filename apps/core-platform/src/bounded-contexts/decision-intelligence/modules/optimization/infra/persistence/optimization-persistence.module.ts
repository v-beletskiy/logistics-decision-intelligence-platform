import { Module } from "@nestjs/common";

import { OptimizationRepository } from "../../domain/optimization.repository";
import { PgOptimizationRepository } from "./repository/pg-optimization.repository";

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
