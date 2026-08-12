import { Module } from "@nestjs/common";

import { DriverRepository } from "../../domain/driver.repository";
import { DriverReadStore } from "../../../../app/driver/queries/search-drivers/driver-read-store";
import { PgDriverReadStore } from "./read-store/driver.pg-read-store";
import { PgDriverRepository } from "./repository/driver.pg-repository";

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
