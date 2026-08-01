import { Module } from '@nestjs/common';

import { ShipmentAppModule } from './shipment/shipment-app.module';
import { RouteAppModule } from './route/route-app.module';
import { AssignmentAppModule } from './assignment/assignment-app.module';
import { VehicleAppModule } from './vehicle/vehicle-app.module';
import { DriverAppModule } from './driver/driver-app.module';

@Module({
  imports: [ShipmentAppModule, RouteAppModule, AssignmentAppModule, VehicleAppModule, DriverAppModule],
  exports: [ShipmentAppModule, RouteAppModule, AssignmentAppModule, VehicleAppModule, DriverAppModule],
})
export class OperationalWorkspaceAppModule {}
