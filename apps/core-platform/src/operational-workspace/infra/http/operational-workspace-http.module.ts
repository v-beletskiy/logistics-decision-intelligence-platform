import { Module } from '@nestjs/common';

import { OperationalWorkspaceAppModule } from '../../app/operational-workspace-app.module';
import { AssignmentController } from '../assignment/http/assignment.controller';
import { DepotController } from '../depot/http/depot.controller';
import { DriverController } from '../driver/http/driver.controller';
import { RouteController } from '../route/http/route.controller';
import { ShipmentController } from '../shipment/http/shipment.controller';
import { VehicleController } from '../vehicle/http/vehicle.controller';

@Module({
  imports: [OperationalWorkspaceAppModule],
  controllers: [
    ShipmentController,
    RouteController,
    AssignmentController,
    VehicleController,
    DriverController,
    DepotController,
  ],
})
export class OperationalWorkspaceHttpModule {}
