import { Module } from "@nestjs/common";

import { RegisterVehicleHandler } from "./commands/register-vehicle/register-vehicle.handler";
import { UpdateVehicleDetailsHandler } from "./commands/update-vehicle-details/update-vehicle-details.handler";
import { ChangeVehicleAvailabilityHandler } from "./commands/change-vehicle-availability/change-vehicle-availability.handler";
import { DecommissionVehicleHandler } from "./commands/decommission-vehicle/decommission-vehicle.handler";
import { SendVehicleToMaintenanceHandler } from "./commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.handler";
import { ReturnVehicleFromMaintenanceHandler } from "./commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.handler";
import { AddVehicleCompartmentHandler } from "./commands/add-vehicle-compartment/add-vehicle-compartment.handler";
import { UpdateVehicleCompartmentHandler } from "./commands/update-vehicle-compartment/update-vehicle-compartment.handler";
import { RemoveVehicleCompartmentHandler } from "./commands/remove-vehicle-compartment/remove-vehicle-compartment.handler";
import { VehiclePersistenceModule } from "../infra/persistence/vehicle-persistence.module";

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
export class VehicleAppModule {}
