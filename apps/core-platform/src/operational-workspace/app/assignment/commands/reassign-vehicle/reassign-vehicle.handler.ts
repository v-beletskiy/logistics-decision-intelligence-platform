import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DistributedApplicationEventBus } from "../../../../../shared/infra/messaging/application-event-bus";
import { DomainEventBus } from "../../../../../shared/infra/messaging/domain-event-bus";
import { IntegrationEventMetadataFactory } from "../../../../../shared/infra/messaging/integration-event.factory";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { AssignmentId } from "../../../../domain-modules/assignment/domain/assignment-id";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { AssignmentPlanningPolicy } from "../../../../shared-domain/services/assignment-planning.policy";
import { ReassignVehicleCommand } from "./reassign-vehicle.command";

@Injectable()
export class ReassignVehicleHandler extends CommandHandler {
  constructor(
    @Inject(AssignmentRepository)
    private readonly assignments: AssignmentRepository,
    @Inject(VehicleRepository) private readonly vehicles: VehicleRepository,
    private readonly assignmentPlanning: AssignmentPlanningPolicy,
    private readonly outbox: DistributedApplicationEventBus,
    private readonly integrationEventFactory: IntegrationEventMetadataFactory,
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

    const activeAssignmentByVehicle =
      await this.assignments.findActiveByVehicleId(vehicle.id.value);

    this.assignmentPlanning.reassignVehicle(
      assignment,
      vehicle,
      activeAssignmentByVehicle,
    );

    await this.execTrxWithDomainEvents(async () => {
      await this.assignments.save(assignment);
      await this.outbox.publish(
        this.integrationEventFactory.create({
          eventType: "operational-workspace.route.assignment-changed",
          eventVersion: 1,
          tenantId: command.tenantId,
          initiatedByUserId: command.initiatedByUserId,
          payload: {
            routeId: assignment.routeId.value,
            assignmentId: assignment.id.value,
          },
        }),
      );
    }, assignment);
  }
}
