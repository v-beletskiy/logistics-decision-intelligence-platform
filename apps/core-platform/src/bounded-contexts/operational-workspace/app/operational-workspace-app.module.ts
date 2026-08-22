import { Module } from "@nestjs/common";

import { ShipmentAppModule } from "../modules/shipment/app/shipment-app.module";
import { RouteAppModule } from "../modules/route/app/route-app.module";
import { AssignmentAppModule } from "../modules/assignment/app/assignment-app.module";
import { VehicleAppModule } from "../modules/vehicle/app/vehicle-app.module";
import { DriverAppModule } from "../modules/driver/app/driver-app.module";
import { DepotAppModule } from "../modules/depot/app/depot-app.module";

@Module({
  imports: [
    ShipmentAppModule,
    RouteAppModule,
    AssignmentAppModule,
    VehicleAppModule,
    DriverAppModule,
    DepotAppModule,
  ],
  exports: [
    ShipmentAppModule,
    RouteAppModule,
    AssignmentAppModule,
    VehicleAppModule,
    DriverAppModule,
    DepotAppModule,
  ],
})
export class OperationalWorkspaceAppModule {}
