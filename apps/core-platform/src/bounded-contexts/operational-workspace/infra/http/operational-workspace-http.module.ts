import { Module } from "@nestjs/common";

import { AssignmentCommandModule } from "../../modules/assignment/composition/assignment-command.module.js";
import { DepotCommandModule } from "../../modules/depot/composition/depot-command.module.js";
import { DriverCommandModule } from "../../modules/driver/composition/driver-command.module.js";
import { DriverQueryModule } from "../../modules/driver/composition/driver-query.module.js";
import { RouteCommandModule } from "../../modules/route/composition/route-command.module.js";
import { ShipmentCommandModule } from "../../modules/shipment/composition/shipment-command.module.js";
import { VehicleCommandModule } from "../../modules/vehicle/composition/vehicle-command.module.js";
import { AssignmentController } from "../../modules/assignment/infra/http/assignment.controller.js";
import { DepotController } from "../../modules/depot/infra/http/depot.controller.js";
import { DriverController } from "../../modules/driver/infra/http/driver.controller.js";
import { RouteController } from "../../modules/route/infra/http/route.controller.js";
import { ShipmentController } from "../../modules/shipment/infra/http/shipment.controller.js";
import { VehicleController } from "../../modules/vehicle/infra/http/vehicle.controller.js";

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
