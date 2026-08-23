import { Module } from "@nestjs/common";

import { AssignmentCommandModule } from "../../modules/assignment/composition/assignment-command.module";
import { DepotCommandModule } from "../../modules/depot/composition/depot-command.module";
import { DriverCommandModule } from "../../modules/driver/composition/driver-command.module";
import { DriverQueryModule } from "../../modules/driver/composition/driver-query.module";
import { RouteCommandModule } from "../../modules/route/composition/route-command.module";
import { ShipmentCommandModule } from "../../modules/shipment/composition/shipment-command.module";
import { VehicleCommandModule } from "../../modules/vehicle/composition/vehicle-command.module";
import { AssignmentController } from "../../modules/assignment/infra/http/assignment.controller";
import { DepotController } from "../../modules/depot/infra/http/depot.controller";
import { DriverController } from "../../modules/driver/infra/http/driver.controller";
import { RouteController } from "../../modules/route/infra/http/route.controller";
import { ShipmentController } from "../../modules/shipment/infra/http/shipment.controller";
import { VehicleController } from "../../modules/vehicle/infra/http/vehicle.controller";

@Module({
  imports: [
    ShipmentCommandModule,
    RouteCommandModule,
    AssignmentCommandModule,
    VehicleCommandModule,
    DriverCommandModule,
    DriverQueryModule,
    DepotCommandModule,
  ],
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
