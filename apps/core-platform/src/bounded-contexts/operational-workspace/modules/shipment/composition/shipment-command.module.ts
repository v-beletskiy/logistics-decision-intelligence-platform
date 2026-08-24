import { Module } from "@nestjs/common";

import { CancelShipmentHandler } from "../app/commands/cancel-shipment/cancel-shipment.handler.js";
import { CompleteDeliveryHandler } from "../app/commands/complete-delivery/complete-delivery.handler.js";
import { CompletePickupHandler } from "../app/commands/complete-pickup/complete-pickup.handler.js";
import { CreateShipmentHandler } from "../app/commands/create-shipment/create-shipment.handler.js";
import { UpdateShipmentDetailsHandler } from "../app/commands/update-shipment-details/update-shipment-details.handler.js";
import { ShipmentPersistenceModule } from "../infra/persistence/shipment-persistence.module.js";

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
