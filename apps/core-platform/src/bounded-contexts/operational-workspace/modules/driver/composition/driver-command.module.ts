import { Module } from "@nestjs/common";

import { DepotPersistenceModule } from "../../depot/infra/persistence/depot-persistence.module.js";
import { AddDriverCertificationHandler } from "../app/commands/add-driver-certification/add-driver-certification.handler.js";
import { ChangeDriverAvailabilityHandler } from "../app/commands/change-driver-availability/change-driver-availability.handler.js";
import { RegisterDriverHandler } from "../app/commands/register-driver/register-driver.handler.js";
import { ReinstateDriverHandler } from "../app/commands/reinstate-driver/reinstate-driver.handler.js";
import { RemoveDriverCertificationHandler } from "../app/commands/remove-driver-certification/remove-driver-certification.handler.js";
import { SuspendDriverHandler } from "../app/commands/suspend-driver/suspend-driver.handler.js";
import { UpdateDriverCertificationHandler } from "../app/commands/update-driver-certification/update-driver-certification.handler.js";
import { UpdateDriverDetailsHandler } from "../app/commands/update-driver-details/update-driver-details.handler.js";
import { DriverPersistenceModule } from "../infra/persistence/driver-persistence.module.js";

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
