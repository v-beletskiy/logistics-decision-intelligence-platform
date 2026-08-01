import { Module } from '@nestjs/common';

import { CreateShipmentHandler } from './app/shipment/commands/create-shipment/create-shipment.handler';
import { UpdateShipmentDetailsHandler } from './app/shipment/commands/update-shipment-details/update-shipment-details.handler';
import { CancelShipmentHandler } from './app/shipment/commands/cancel-shipment/cancel-shipment.handler';
import { CompletePickupHandler } from './app/shipment/commands/complete-pickup/complete-pickup.handler';
import { CompleteDeliveryHandler } from './app/shipment/commands/complete-delivery/complete-delivery.handler';
import { CreateRouteHandler } from './app/route/commands/create-route/create-route.handler';
import { ReorderRouteStopsHandler } from './app/route/commands/reorder-route-stops/reorder-route-stops.handler';
import { StartRouteHandler } from './app/route/commands/start-route/start-route.handler';
import { CompleteRouteHandler } from './app/route/commands/complete-route/complete-route.handler';
import { CreateAssignmentHandler } from './app/assignment/commands/create-assignment/create-assignment.handler';
import { ReassignVehicleHandler } from './app/assignment/commands/reassign-vehicle/reassign-vehicle.handler';
import { ReassignDriverHandler } from './app/assignment/commands/reassign-driver/reassign-driver.handler';
import { StartAssignmentHandler } from './app/assignment/commands/start-assignment/start-assignment.handler';
import { CompleteAssignmentHandler } from './app/assignment/commands/complete-assignment/complete-assignment.handler';
import { CancelAssignmentHandler } from './app/assignment/commands/cancel-assignment/cancel-assignment.handler';
import { RegisterVehicleHandler } from './app/vehicle/commands/register-vehicle/register-vehicle.handler';
import { UpdateVehicleDetailsHandler } from './app/vehicle/commands/update-vehicle-details/update-vehicle-details.handler';
import { ChangeVehicleAvailabilityHandler } from './app/vehicle/commands/change-vehicle-availability/change-vehicle-availability.handler';
import { DecommissionVehicleHandler } from './app/vehicle/commands/decommission-vehicle/decommission-vehicle.handler';
import { RegisterDriverHandler } from './app/driver/commands/register-driver/register-driver.handler';
import { UpdateDriverDetailsHandler } from './app/driver/commands/update-driver-details/update-driver-details.handler';
import { ChangeDriverAvailabilityHandler } from './app/driver/commands/change-driver-availability/change-driver-availability.handler';
import { SuspendDriverHandler } from './app/driver/commands/suspend-driver/suspend-driver.handler';
import { ReinstateDriverHandler } from './app/driver/commands/reinstate-driver/reinstate-driver.handler';
import { ShipmentRepository } from './domain-modules/shipment/domain/shipment.repository';
import { PgShipmentRepository } from './domain-modules/shipment/infra/persistence/shipment.pg-repository';
import { RouteRepository } from './domain-modules/route/domain/route.repository';
import { PgRouteRepository } from './domain-modules/route/infra/persistence/route.pg-repository';
import { AssignmentRepository } from './domain-modules/assignment/domain/assignment.repository';
import { PgAssignmentRepository } from './domain-modules/assignment/infra/persistence/assignment.pg-repository';
import { VehicleRepository } from './domain-modules/vehicle/domain/vehicle.repository';
import { PgVehicleRepository } from './domain-modules/vehicle/infra/persistence/vehicle.pg-repository';
import { DriverRepository } from './domain-modules/driver/domain/driver.repository';
import { PgDriverRepository } from './domain-modules/driver/infra/persistence/driver.pg-repository';
import { DepotRepository } from './domain-modules/depot/domain/depot.repository';
import { PgDepotRepository } from './domain-modules/depot/infra/persistence/depot.pg-repository';
import { AssignmentController } from './infra/assignment/http/assignment.controller';
import { DepotController } from './infra/depot/http/depot.controller';
import { DriverController } from './infra/driver/http/driver.controller';
import { RouteController } from './infra/route/http/route.controller';
import { ShipmentController } from './infra/shipment/http/shipment.controller';
import { VehicleController } from './infra/vehicle/http/vehicle.controller';

@Module({
  controllers: [
    ShipmentController,
    RouteController,
    AssignmentController,
    VehicleController,
    DriverController,
    DepotController,
  ],
  providers: [
    CreateShipmentHandler,
    UpdateShipmentDetailsHandler,
    CancelShipmentHandler,
    CompletePickupHandler,
    CompleteDeliveryHandler,
    CreateRouteHandler,
    ReorderRouteStopsHandler,
    StartRouteHandler,
    CompleteRouteHandler,
    CreateAssignmentHandler,
    ReassignVehicleHandler,
    ReassignDriverHandler,
    StartAssignmentHandler,
    CompleteAssignmentHandler,
    CancelAssignmentHandler,
    RegisterVehicleHandler,
    UpdateVehicleDetailsHandler,
    ChangeVehicleAvailabilityHandler,
    DecommissionVehicleHandler,
    RegisterDriverHandler,
    UpdateDriverDetailsHandler,
    ChangeDriverAvailabilityHandler,
    SuspendDriverHandler,
    ReinstateDriverHandler,
    {
      provide: ShipmentRepository,
      useClass: PgShipmentRepository,
    },
    {
      provide: RouteRepository,
      useClass: PgRouteRepository,
    },
    {
      provide: AssignmentRepository,
      useClass: PgAssignmentRepository,
    },
    {
      provide: VehicleRepository,
      useClass: PgVehicleRepository,
    },
    {
      provide: DriverRepository,
      useClass: PgDriverRepository,
    },
    {
      provide: DepotRepository,
      useClass: PgDepotRepository,
    },
  ],
})
export class OperationalWorkspaceModule {}
