import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { InternalApplicationEventBus } from "../../../../../shared/app/messaging/internal-application-event-bus";
import { routeInputChangedAppEvent } from "../../../../contracts/events/route-input-changed.application-event";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { AssignmentId } from "../../../../domain-modules/assignment/domain/assignment-id";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { CancelAssignmentCommand } from "./cancel-assignment.command";

@Injectable()
export class CancelAssignmentHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly internalApplicationEventBus: InternalApplicationEventBus,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: ExecutionRequest<CancelAssignmentCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    await this.execUseCaseTrx(async () => {
      const loadedAssignment = await this.assignmentRepository.findById(
        context.tenantId,
        AssignmentId.from(command.assignmentId),
      );
      if (!loadedAssignment) throw new AggregateNotFoundException("Assignment");

      const assignment = loadedAssignment.aggregate;

      assignment.cancel();
      await this.assignmentRepository.save(context.tenantId, loadedAssignment);

      await this.internalApplicationEventBus.publish(
        routeInputChangedAppEvent({
          routeId: assignment.routeId.value,
          tenantId: context.tenantId,
        }),
      );

      return { result: assignment.routeId.value, eventsFrom: [assignment] };
    });
  }
}
