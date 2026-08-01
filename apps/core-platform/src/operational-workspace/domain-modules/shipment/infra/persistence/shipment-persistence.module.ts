import { Module } from '@nestjs/common';

import { ShipmentRepository } from '../../domain/shipment.repository';
import { PgShipmentRepository } from './shipment.pg-repository';

@Module({
  providers: [
    {
      provide: ShipmentRepository,
      useClass: PgShipmentRepository,
    },
  ],
  exports: [ShipmentRepository],
})
export class ShipmentPersistenceModule {}
