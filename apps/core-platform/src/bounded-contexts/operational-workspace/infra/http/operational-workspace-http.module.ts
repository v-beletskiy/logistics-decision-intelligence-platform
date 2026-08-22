import { Module } from "@nestjs/common";

import { OperationalWorkspaceAppModule } from "../../app/operational-workspace-app.module";
import { AssignmentController } from "../../modules/assignment/infra/http/assignment.controller";
import { DepotController } from "../../modules/depot/infra/http/depot.controller";
import { DriverController } from "../../modules/driver/infra/http/driver.controller";
import { RouteController } from "../../modules/route/infra/http/route.controller";
import { ShipmentController } from "../../modules/shipment/infra/http/shipment.controller";
import { VehicleController } from "../../modules/vehicle/infra/http/vehicle.controller";

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
