import { Module } from "@nestjs/common";

import { DepotRepository } from "../../domain/depot.repository";
import { PgDepotRepository } from "./repository/pg-depot.repository";

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
