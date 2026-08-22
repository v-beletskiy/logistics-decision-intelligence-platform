import { Module } from "@nestjs/common";

import { CreateAssignmentHandler } from "./commands/create-assignment/create-assignment.handler";
import { ReassignVehicleHandler } from "./commands/reassign-vehicle/reassign-vehicle.handler";
import { ReassignDriverHandler } from "./commands/reassign-driver/reassign-driver.handler";
import { StartAssignmentHandler } from "./commands/start-assignment/start-assignment.handler";
import { CompleteAssignmentHandler } from "./commands/complete-assignment/complete-assignment.handler";
import { CancelAssignmentHandler } from "./commands/cancel-assignment/cancel-assignment.handler";
import { AssignmentPlanningPolicy } from "../../../domain/assignment-planning.policy";
import { AssignmentPersistenceModule } from "../infra/persistence/assignment-persistence.module";
import { RoutePersistenceModule } from "../../route/infra/persistence/route-persistence.module";
import { VehiclePersistenceModule } from "../../vehicle/infra/persistence/vehicle-persistence.module";
import { DriverPersistenceModule } from "../../driver/infra/persistence/driver-persistence.module";
import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module";

@Module({
  imports: [
    AssignmentPersistenceModule,
    RoutePersistenceModule,
    VehiclePersistenceModule,
    DriverPersistenceModule,
    ShipmentPersistenceModule,
  ],
  providers: [
    AssignmentPlanningPolicy,
    CreateAssignmentHandler,
    ReassignVehicleHandler,
    ReassignDriverHandler,
    StartAssignmentHandler,
    CompleteAssignmentHandler,
    CancelAssignmentHandler,
  ],
  exports: [
    AssignmentPlanningPolicy,
    CreateAssignmentHandler,
    ReassignVehicleHandler,
    ReassignDriverHandler,
    StartAssignmentHandler,
    CompleteAssignmentHandler,
    CancelAssignmentHandler,
  ],
})
export class AssignmentAppModule {}
