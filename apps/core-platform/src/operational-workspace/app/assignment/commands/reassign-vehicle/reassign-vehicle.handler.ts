import { Inject, Injectable } from "@nestjs/common";
import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { AssignmentId } from "../../../../domain-modules/assignment/domain/assignment-id";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { AssignmentPlanningPolicy } from "../../../../shared-domain/policies/assignment-planning.policy";
import { ReassignVehicleCommand } from "./reassign-vehicle.command";

@Injectable()
export class ReassignVehicleHandler extends CommandHandler {
  constructor(
    @Inject(AssignmentRepository)
    private readonly assignments: AssignmentRepository,
    @Inject(VehicleRepository) private readonly vehicles: VehicleRepository,
    private readonly assignmentPlanning: AssignmentPlanningPolicy,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(command: ReassignVehicleCommand): Promise<void> {
    const assignment = await this.assignments.findById(
      AssignmentId.from(command.assignmentId),
    );
    if (!assignment) throw new AggregateNotFoundException("Assignment");

    const vehicle = await this.vehicles.findById(
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    const keepsCurrentVehicle = assignment.vehicleId.equals(vehicle.id);
    if (keepsCurrentVehicle) {
      assignment.assignVehicle(vehicle.id);
      return;
    }

    const vehicleHasActiveAssignment =
      await this.assignments.existsActiveForVehicle(vehicle.id);

    this.assignmentPlanning.assertVehicleCanBeAssigned(
      vehicle,
      assignment.shipments,
      vehicleHasActiveAssignment,
    );
    assignment.assignVehicle(vehicle.id);

    await this.execTrxWithDomainEvents(async () => {
      await this.assignments.save(assignment);
    }, assignment);
  }
}
