import { Module } from "@nestjs/common";

import { AddVehicleCompartmentHandler } from "../app/commands/add-vehicle-compartment/add-vehicle-compartment.handler.js";
import { ChangeVehicleAvailabilityHandler } from "../app/commands/change-vehicle-availability/change-vehicle-availability.handler.js";
import { DecommissionVehicleHandler } from "../app/commands/decommission-vehicle/decommission-vehicle.handler.js";
import { RegisterVehicleHandler } from "../app/commands/register-vehicle/register-vehicle.handler.js";
import { RemoveVehicleCompartmentHandler } from "../app/commands/remove-vehicle-compartment/remove-vehicle-compartment.handler.js";
import { ReturnVehicleFromMaintenanceHandler } from "../app/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.handler.js";
import { SendVehicleToMaintenanceHandler } from "../app/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.handler.js";
import { UpdateVehicleCompartmentHandler } from "../app/commands/update-vehicle-compartment/update-vehicle-compartment.handler.js";
import { UpdateVehicleDetailsHandler } from "../app/commands/update-vehicle-details/update-vehicle-details.handler.js";
import { VehiclePersistenceModule } from "../infra/persistence/vehicle-persistence.module.js";

@Module({
  imports: [VehiclePersistenceModule],
  providers: [
    RegisterVehicleHandler,
    UpdateVehicleDetailsHandler,
    ChangeVehicleAvailabilityHandler,
    DecommissionVehicleHandler,
    SendVehicleToMaintenanceHandler,
    ReturnVehicleFromMaintenanceHandler,
    AddVehicleCompartmentHandler,
    UpdateVehicleCompartmentHandler,
    RemoveVehicleCompartmentHandler,
  ],
  exports: [
    RegisterVehicleHandler,
    UpdateVehicleDetailsHandler,
    ChangeVehicleAvailabilityHandler,
    DecommissionVehicleHandler,
    SendVehicleToMaintenanceHandler,
    ReturnVehicleFromMaintenanceHandler,
    AddVehicleCompartmentHandler,
    UpdateVehicleCompartmentHandler,
    RemoveVehicleCompartmentHandler,
  ],
})
export class VehicleCommandModule {}
