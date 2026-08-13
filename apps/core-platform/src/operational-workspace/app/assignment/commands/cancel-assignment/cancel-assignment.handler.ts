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
import { CancelAssignmentCommand } from "./cancel-assignment.command";

@Injectable()
export class CancelAssignmentHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
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
    const assignment = await this.assignmentRepository.findById(
      context.tenantId,
      AssignmentId.from(command.assignmentId),
    );
    if (!assignment) throw new AggregateNotFoundException("Assignment");

    assignment.cancel();
    await this.execTrxWithDomainEvents(async () => {
      await this.assignmentRepository.save(context.tenantId, assignment);
    }, assignment);
  }
}
