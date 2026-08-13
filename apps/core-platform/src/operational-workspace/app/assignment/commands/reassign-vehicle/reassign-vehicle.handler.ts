import { Injectable } from "@nestjs/common";
import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
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
    private readonly assignmentRepository: AssignmentRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly assignmentPlanningPolicy: AssignmentPlanningPolicy,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: ExecutionRequest<ReassignVehicleCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    const assignment = await this.assignmentRepository.findById(
      context.tenantId,
      AssignmentId.from(command.assignmentId),
    );
    if (!assignment) throw new AggregateNotFoundException("Assignment");

    const vehicle = await this.vehicleRepository.findById(
      context.tenantId,
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    const keepsCurrentVehicle = assignment.vehicleId.equals(vehicle.id);
    if (keepsCurrentVehicle) {
      assignment.assignVehicle(vehicle.id);
      return;
    }

    const vehicleHasActiveAssignment =
      await this.assignmentRepository.existsActiveForVehicle(
        context.tenantId,
        vehicle.id,
      );

    this.assignmentPlanningPolicy.assertVehicleCanBeAssigned(
      vehicle,
      assignment.shipments,
      vehicleHasActiveAssignment,
    );
    assignment.assignVehicle(vehicle.id);

    await this.execTrxWithDomainEvents(async () => {
      await this.assignmentRepository.save(context.tenantId, assignment);
    }, assignment);
  }
}
