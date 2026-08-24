import { Module } from "@nestjs/common";

import { DepotRepository } from "../../domain/depot.repository.js";
import { PgDepotRepository } from "./repository/pg-depot.repository.js";

@Module({
  providers: [
    {
      provide: DepotRepository,
      useClass: PgDepotRepository,
    },
  ],
  exports: [DepotRepository],
})
export class DepotPersistenceModule {}
