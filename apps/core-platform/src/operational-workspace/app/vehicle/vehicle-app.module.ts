import { Module } from '@nestjs/common';

import { RegisterVehicleHandler } from './commands/register-vehicle/register-vehicle.handler';
import { UpdateVehicleDetailsHandler } from './commands/update-vehicle-details/update-vehicle-details.handler';
import { ChangeVehicleAvailabilityHandler } from './commands/change-vehicle-availability/change-vehicle-availability.handler';
import { DecommissionVehicleHandler } from './commands/decommission-vehicle/decommission-vehicle.handler';
import { VehiclePersistenceModule } from '../../domain-modules/vehicle/infra/persistence/vehicle-persistence.module';

@Module({
  imports: [VehiclePersistenceModule],
  providers: [
    RegisterVehicleHandler,
    UpdateVehicleDetailsHandler,
    ChangeVehicleAvailabilityHandler,
    DecommissionVehicleHandler,
  ],
  exports: [
    RegisterVehicleHandler,
    UpdateVehicleDetailsHandler,
    ChangeVehicleAvailabilityHandler,
    DecommissionVehicleHandler,
  ],
})
export class VehicleAppModule {}
