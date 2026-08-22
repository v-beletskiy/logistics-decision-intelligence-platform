import { Module } from "@nestjs/common";

import { CreateDepotHandler } from "./commands/create-depot/create-depot.handler";
import { UpdateDepotDetailsHandler } from "./commands/update-depot-details/update-depot-details.handler";
import { UpdateDepotVehicleCapacityHandler } from "./commands/update-depot-vehicle-capacity/update-depot-vehicle-capacity.handler";
import { UpdateDepotDriverCapacityHandler } from "./commands/update-depot-driver-capacity/update-depot-driver-capacity.handler";
import { ActivateDepotHandler } from "./commands/activate-depot/activate-depot.handler";
import { InactivateDepotHandler } from "./commands/inactivate-depot/inactivate-depot.handler";
import { CloseDepotHandler } from "./commands/close-depot/close-depot.handler";
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
export class DepotAppModule {}
