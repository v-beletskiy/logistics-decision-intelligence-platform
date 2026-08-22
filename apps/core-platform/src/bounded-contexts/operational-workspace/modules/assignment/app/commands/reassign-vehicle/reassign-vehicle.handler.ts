import { Injectable } from "@nestjs/common";
import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { AssignmentId } from "../../../domain/assignment-id";
import { AssignmentRepository } from "../../../domain/assignment.repository";
import { VehicleId } from "../../../../vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../vehicle/domain/vehicle.repository";
import { AssignmentPlanningPolicy } from "../../../../../domain/assignment-planning.policy";
import { ReassignVehicleCommand } from "./reassign-vehicle.command";

@Injectable()
export class ReassignVehicleHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly assignmentPlanningPolicy: AssignmentPlanningPolicy,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(request: UseCaseRequest<ReassignVehicleCommand>): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedAssignment = await this.assignmentRepository.findById(
        context.tenantId,
        AssignmentId.from(command.assignmentId),
      );
      if (!loadedAssignment) {
        throw new AggregateNotFoundException("Assignment");
      }
      const assignment = loadedAssignment.aggregate;

      const loadedVehicle = await this.vehicleRepository.findById(
        context.tenantId,
        VehicleId.from(command.vehicleId),
      );
      if (!loadedVehicle) throw new AggregateNotFoundException("Vehicle");
      const vehicle = loadedVehicle.aggregate;

      if (assignment.vehicleId.equals(vehicle.id)) {
        return { result: undefined, eventsFrom: [] };
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
      await this.assignmentRepository.save(context.tenantId, loadedAssignment);
      return { result: undefined, eventsFrom: [assignment] };
    });
  }
}
