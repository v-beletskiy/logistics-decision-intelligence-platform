import { Module } from "@nestjs/common";

import { VehicleRepository } from "../../domain/vehicle.repository.js";
import { PgVehicleRepository } from "./repository/pg-vehicle.repository.js";

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
