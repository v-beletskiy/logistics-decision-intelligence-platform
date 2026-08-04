import { Module } from "@nestjs/common";

import { DriverRepository } from "../../domain/driver.repository";
import { PgDriverRepository } from "./driver.pg-repository";

@Module({
  providers: [
    {
      provide: DriverRepository,
      useClass: PgDriverRepository,
    },
  ],
  exports: [DriverRepository],
})
export class DriverPersistenceModule {}
