import { Module } from "@nestjs/common";

import { SearchDriversHandler } from "../app/queries/search-drivers/search-drivers.handler";
import { DriverPersistenceModule } from "../infra/persistence/driver-persistence.module";

@Module({
  imports: [DriverPersistenceModule],
  providers: [SearchDriversHandler],
  exports: [SearchDriversHandler],
})
export class DriverQueryModule {}
