import { Module } from "@nestjs/common";

import { AssignmentPlanningPolicy } from "../../../domain/assignment-planning.policy";
import { CancelAssignmentHandler } from "../app/commands/cancel-assignment/cancel-assignment.handler";
import { CompleteAssignmentHandler } from "../app/commands/complete-assignment/complete-assignment.handler";
import { CreateAssignmentHandler } from "../app/commands/create-assignment/create-assignment.handler";
import { ReassignDriverHandler } from "../app/commands/reassign-driver/reassign-driver.handler";
import { ReassignVehicleHandler } from "../app/commands/reassign-vehicle/reassign-vehicle.handler";
import { StartAssignmentHandler } from "../app/commands/start-assignment/start-assignment.handler";
import { DriverPersistenceModule } from "../../driver/infra/persistence/driver-persistence.module";
import { RoutePersistenceModule } from "../../route/infra/persistence/route-persistence.module";
import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module";
import { VehiclePersistenceModule } from "../../vehicle/infra/persistence/vehicle-persistence.module";
import { AssignmentPersistenceModule } from "../infra/persistence/assignment-persistence.module";

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
export class AssignmentCommandModule {}
