import { Module } from '@nestjs/common';

import { VehicleRepository } from '../../domain/vehicle.repository';
import { PgVehicleRepository } from './repository/vehicle.pg-repository';

@Module({
  providers: [
    {
      provide: VehicleRepository,
      useClass: PgVehicleRepository,
    },
  ],
  exports: [VehicleRepository],
})
export class VehiclePersistenceModule {}
