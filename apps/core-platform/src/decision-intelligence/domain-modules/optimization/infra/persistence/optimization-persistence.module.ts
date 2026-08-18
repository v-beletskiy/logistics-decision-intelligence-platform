import { Module } from "@nestjs/common";

import { OptimizationRepository } from "../../domain/optimization.repository";
import { PgOptimizationRepository } from "./optimization.pg-repository";

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
