import { Inject, Injectable } from "@nestjs/common";
import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { AssignmentId } from "../../../../domain-modules/assignment/domain/assignment-id";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { AssignmentPlanningPolicy } from "../../../../shared-domain/policies/assignment-planning.policy";
import { ReassignDriverCommand } from "./reassign-driver.command";

@Injectable()
export class ReassignDriverHandler extends CommandHandler {
  constructor(
    @Inject(AssignmentRepository)
    private readonly assignments: AssignmentRepository,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    private readonly assignmentPlanning: AssignmentPlanningPolicy,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(command: ReassignDriverCommand): Promise<void> {
    const assignment = await this.assignments.findById(
      AssignmentId.from(command.assignmentId),
    );
    if (!assignment) throw new AggregateNotFoundException("Assignment");

    const driver = await this.drivers.findById(DriverId.from(command.driverId));
    if (!driver) throw new AggregateNotFoundException("Driver");

    const keepsCurrentDriver = assignment.driverId.equals(driver.id);
    if (keepsCurrentDriver) {
      assignment.assignDriver(driver.id);
      return;
    }

    const driverHasActiveAssignment = await this.assignments.existsActiveForDriver(
      driver.id,
    );

    this.assignmentPlanning.assertDriverCanBeAssigned(
      driver,
      driverHasActiveAssignment,
    );
    assignment.assignDriver(driver.id);

    await this.execTrxWithDomainEvents(async () => {
      await this.assignments.save(assignment);
    }, assignment);
  }
}
