import { Module } from "@nestjs/common";

import { CancelShipmentHandler } from "../app/commands/cancel-shipment/cancel-shipment.handler";
import { CompleteDeliveryHandler } from "../app/commands/complete-delivery/complete-delivery.handler";
import { CompletePickupHandler } from "../app/commands/complete-pickup/complete-pickup.handler";
import { CreateShipmentHandler } from "../app/commands/create-shipment/create-shipment.handler";
import { UpdateShipmentDetailsHandler } from "../app/commands/update-shipment-details/update-shipment-details.handler";
import { ShipmentPersistenceModule } from "../infra/persistence/shipment-persistence.module";

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
export class ShipmentCommandModule {}
