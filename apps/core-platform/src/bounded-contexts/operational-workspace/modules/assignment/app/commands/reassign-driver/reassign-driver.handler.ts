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
import { DriverId } from "../../../../driver/domain/driver-id";
import { DriverRepository } from "../../../../driver/domain/driver.repository";
import { AssignmentPlanningPolicy } from "../../../../../domain/assignment-planning.policy";
import { ReassignDriverCommand } from "./reassign-driver.command";

@Injectable()
export class ReassignDriverHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly driverRepository: DriverRepository,
    private readonly assignmentPlanningPolicy: AssignmentPlanningPolicy,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(request: UseCaseRequest<ReassignDriverCommand>): Promise<void> {
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
