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
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { AssignmentPlanningPolicy } from "../../../../domain-modules/assignment/domain/policies/assignment-planning.policy";
import { ReassignDriverCommand } from "./reassign-driver.command";

@Injectable()
export class ReassignDriverHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly driverRepository: DriverRepository,
    private readonly assignmentPlanningPolicy: AssignmentPlanningPolicy,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: ExecutionRequest<ReassignDriverCommand>,
  ): Promise<void> {
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

      const loadedDriver = await this.driverRepository.findById(
        context.tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");
      const driver = loadedDriver.aggregate;

      if (assignment.driverId.equals(driver.id)) {
        return { result: undefined, eventsFrom: [] };
      }

      const driverHasActiveAssignment =
        await this.assignmentRepository.existsActiveForDriver(
          context.tenantId,
          driver.id,
        );

      this.assignmentPlanningPolicy.assertDriverCanBeAssigned(
        driver,
        driverHasActiveAssignment,
      );
      assignment.assignDriver(driver.id);
      await this.assignmentRepository.save(context.tenantId, loadedAssignment);
      return { result: undefined, eventsFrom: [assignment] };
    });
  }
}
