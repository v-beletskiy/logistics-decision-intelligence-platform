import { Module } from "@nestjs/common";

import { DriverRepository } from "../../domain/driver.repository";
import { DriverReadStore } from "../../app/ports/driver-read-store";
import { PgDriverReadStore } from "./read-store/pg-driver.read-store";
import { PgDriverRepository } from "./repository/pg-driver.repository";

@Module({
  providers: [
    {
      provide: DriverRepository,
      useClass: PgDriverRepository,
    },
    {
      provide: DriverReadStore,
      useClass: PgDriverReadStore,
    },
  ],
  exports: [DriverRepository, DriverReadStore],
})
export class DriverPersistenceModule {}
