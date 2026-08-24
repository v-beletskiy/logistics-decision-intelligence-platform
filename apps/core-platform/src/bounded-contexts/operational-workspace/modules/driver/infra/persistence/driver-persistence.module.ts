import { Module } from "@nestjs/common";

import { DriverRepository } from "../../domain/driver.repository.js";
import { DriverReadStore } from "../../app/ports/driver-read-store.js";
import { PgDriverReadStore } from "./read-store/pg-driver.read-store.js";
import { PgDriverRepository } from "./repository/pg-driver.repository.js";

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
