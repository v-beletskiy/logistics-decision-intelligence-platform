import { Module } from "@nestjs/common";

import { ShipmentRepository } from "../../domain/shipment.repository.js";
import { PgShipmentRepository } from "./repository/pg-shipment.repository.js";

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
