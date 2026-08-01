import { Module } from '@nestjs/common';

import { CreateShipmentHandler } from './commands/create-shipment/create-shipment.handler';
import { UpdateShipmentDetailsHandler } from './commands/update-shipment-details/update-shipment-details.handler';
import { CancelShipmentHandler } from './commands/cancel-shipment/cancel-shipment.handler';
import { CompletePickupHandler } from './commands/complete-pickup/complete-pickup.handler';
import { CompleteDeliveryHandler } from './commands/complete-delivery/complete-delivery.handler';
import { ShipmentPersistenceModule } from '../../domain-modules/shipment/infra/persistence/shipment-persistence.module';

@Module({
  imports: [ShipmentPersistenceModule],
  providers: [
    CreateShipmentHandler,
    UpdateShipmentDetailsHandler,
    CancelShipmentHandler,
    CompletePickupHandler,
    CompleteDeliveryHandler,
  ],
  exports: [
    CreateShipmentHandler,
    UpdateShipmentDetailsHandler,
    CancelShipmentHandler,
    CompletePickupHandler,
    CompleteDeliveryHandler,
  ],
})
export class ShipmentAppModule {}
