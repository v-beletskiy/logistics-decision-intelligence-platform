import { Module } from "@nestjs/common";

import { ShipmentAppModule } from "./shipment/shipment-app.module";
import { RouteAppModule } from "./route/route-app.module";
import { AssignmentAppModule } from "./assignment/assignment-app.module";
import { VehicleAppModule } from "./vehicle/vehicle-app.module";
import { DriverAppModule } from "./driver/driver-app.module";
import { DepotAppModule } from "./depot/depot-app.module";

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
