import { Module } from "@nestjs/common";

import { AddVehicleCompartmentHandler } from "../app/commands/add-vehicle-compartment/add-vehicle-compartment.handler";
import { ChangeVehicleAvailabilityHandler } from "../app/commands/change-vehicle-availability/change-vehicle-availability.handler";
import { DecommissionVehicleHandler } from "../app/commands/decommission-vehicle/decommission-vehicle.handler";
import { RegisterVehicleHandler } from "../app/commands/register-vehicle/register-vehicle.handler";
import { RemoveVehicleCompartmentHandler } from "../app/commands/remove-vehicle-compartment/remove-vehicle-compartment.handler";
import { ReturnVehicleFromMaintenanceHandler } from "../app/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.handler";
import { SendVehicleToMaintenanceHandler } from "../app/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.handler";
import { UpdateVehicleCompartmentHandler } from "../app/commands/update-vehicle-compartment/update-vehicle-compartment.handler";
import { UpdateVehicleDetailsHandler } from "../app/commands/update-vehicle-details/update-vehicle-details.handler";
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
export class VehicleCommandModule {}
