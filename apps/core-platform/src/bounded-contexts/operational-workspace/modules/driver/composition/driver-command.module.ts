import { Module } from "@nestjs/common";

import { DepotPersistenceModule } from "../../depot/infra/persistence/depot-persistence.module";
import { AddDriverCertificationHandler } from "../app/commands/add-driver-certification/add-driver-certification.handler";
import { ChangeDriverAvailabilityHandler } from "../app/commands/change-driver-availability/change-driver-availability.handler";
import { RegisterDriverHandler } from "../app/commands/register-driver/register-driver.handler";
import { ReinstateDriverHandler } from "../app/commands/reinstate-driver/reinstate-driver.handler";
import { RemoveDriverCertificationHandler } from "../app/commands/remove-driver-certification/remove-driver-certification.handler";
import { SuspendDriverHandler } from "../app/commands/suspend-driver/suspend-driver.handler";
import { UpdateDriverCertificationHandler } from "../app/commands/update-driver-certification/update-driver-certification.handler";
import { UpdateDriverDetailsHandler } from "../app/commands/update-driver-details/update-driver-details.handler";
import { DriverPersistenceModule } from "../infra/persistence/driver-persistence.module";

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
  ],
})
export class DriverCommandModule {}
