import { Module } from '@nestjs/common';

import { RegisterDriverHandler } from './commands/register-driver/register-driver.handler';
import { UpdateDriverDetailsHandler } from './commands/update-driver-details/update-driver-details.handler';
import { ChangeDriverAvailabilityHandler } from './commands/change-driver-availability/change-driver-availability.handler';
import { SuspendDriverHandler } from './commands/suspend-driver/suspend-driver.handler';
import { ReinstateDriverHandler } from './commands/reinstate-driver/reinstate-driver.handler';
import { DriverPersistenceModule } from '../../domain-modules/driver/infra/persistence/driver-persistence.module';

@Module({
  imports: [DriverPersistenceModule],
  providers: [
    RegisterDriverHandler,
    UpdateDriverDetailsHandler,
    ChangeDriverAvailabilityHandler,
    SuspendDriverHandler,
    ReinstateDriverHandler,
  ],
  exports: [
    RegisterDriverHandler,
    UpdateDriverDetailsHandler,
    ChangeDriverAvailabilityHandler,
    SuspendDriverHandler,
    ReinstateDriverHandler,
  ],
})
export class DriverAppModule {}
