import { Module } from "@nestjs/common";

import { AssignmentPlanningPolicy } from "../../../domain/assignment-planning.policy.js";
import { CancelAssignmentHandler } from "../app/commands/cancel-assignment/cancel-assignment.handler.js";
import { CompleteAssignmentHandler } from "../app/commands/complete-assignment/complete-assignment.handler.js";
import { CreateAssignmentHandler } from "../app/commands/create-assignment/create-assignment.handler.js";
import { ReassignDriverHandler } from "../app/commands/reassign-driver/reassign-driver.handler.js";
import { ReassignVehicleHandler } from "../app/commands/reassign-vehicle/reassign-vehicle.handler.js";
import { StartAssignmentHandler } from "../app/commands/start-assignment/start-assignment.handler.js";
import { DriverPersistenceModule } from "../../driver/infra/persistence/driver-persistence.module.js";
import { RoutePersistenceModule } from "../../route/infra/persistence/route-persistence.module.js";
import { ShipmentPersistenceModule } from "../../shipment/infra/persistence/shipment-persistence.module.js";
import { VehiclePersistenceModule } from "../../vehicle/infra/persistence/vehicle-persistence.module.js";
import { AssignmentPersistenceModule } from "../infra/persistence/assignment-persistence.module.js";

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
