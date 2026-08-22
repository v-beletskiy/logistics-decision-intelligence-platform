import { Module } from "@nestjs/common";

import { RegisterDriverHandler } from "./commands/register-driver/register-driver.handler";
import { UpdateDriverDetailsHandler } from "./commands/update-driver-details/update-driver-details.handler";
import { ChangeDriverAvailabilityHandler } from "./commands/change-driver-availability/change-driver-availability.handler";
import { SuspendDriverHandler } from "./commands/suspend-driver/suspend-driver.handler";
import { ReinstateDriverHandler } from "./commands/reinstate-driver/reinstate-driver.handler";
import { DriverPersistenceModule } from "../infra/persistence/driver-persistence.module";
import { AddDriverCertificationHandler } from "./commands/add-driver-certification/add-driver-certification.handler";
import { UpdateDriverCertificationHandler } from "./commands/update-driver-certification/update-driver-certification.handler";
import { RemoveDriverCertificationHandler } from "./commands/remove-driver-certification/remove-driver-certification.handler";
import { SearchDriversHandler } from "./queries/search-drivers/search-drivers.handler";
import { DepotPersistenceModule } from "../../depot/infra/persistence/depot-persistence.module";

@Module({
  imports: [DriverPersistenceModule, DepotPersistenceModule],
  providers: [
    RegisterDriverHandler,
    UpdateDriverDetailsHandler,
    ChangeDriverAvailabilityHandler,
    SuspendDriverHandler,
    ReinstateDriverHandler,
    AddDriverCertificationHandler,
    UpdateDriverCertificationHandler,
    RemoveDriverCertificationHandler,
    SearchDriversHandler,
  ],
  exports: [
    RegisterDriverHandler,
    UpdateDriverDetailsHandler,
    ChangeDriverAvailabilityHandler,
    SuspendDriverHandler,
    ReinstateDriverHandler,
    AddDriverCertificationHandler,
    UpdateDriverCertificationHandler,
    RemoveDriverCertificationHandler,
    SearchDriversHandler,
  ],
})
export class DriverAppModule {}
