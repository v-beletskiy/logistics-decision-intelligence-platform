import { Module } from "@nestjs/common";

import { ActivateDepotHandler } from "../app/commands/activate-depot/activate-depot.handler";
import { CloseDepotHandler } from "../app/commands/close-depot/close-depot.handler";
import { CreateDepotHandler } from "../app/commands/create-depot/create-depot.handler";
import { InactivateDepotHandler } from "../app/commands/inactivate-depot/inactivate-depot.handler";
import { UpdateDepotDetailsHandler } from "../app/commands/update-depot-details/update-depot-details.handler";
import { UpdateDepotDriverCapacityHandler } from "../app/commands/update-depot-driver-capacity/update-depot-driver-capacity.handler";
import { UpdateDepotVehicleCapacityHandler } from "../app/commands/update-depot-vehicle-capacity/update-depot-vehicle-capacity.handler";
import { DepotPersistenceModule } from "../infra/persistence/depot-persistence.module";

@Module({
  imports: [DepotPersistenceModule],
  providers: [
    CreateDepotHandler,
    UpdateDepotDetailsHandler,
    UpdateDepotVehicleCapacityHandler,
    UpdateDepotDriverCapacityHandler,
    ActivateDepotHandler,
    InactivateDepotHandler,
    CloseDepotHandler,
  ],
  exports: [
    CreateDepotHandler,
    UpdateDepotDetailsHandler,
    UpdateDepotVehicleCapacityHandler,
    UpdateDepotDriverCapacityHandler,
    ActivateDepotHandler,
    InactivateDepotHandler,
    CloseDepotHandler,
  ],
})
export class DepotCommandModule {}
