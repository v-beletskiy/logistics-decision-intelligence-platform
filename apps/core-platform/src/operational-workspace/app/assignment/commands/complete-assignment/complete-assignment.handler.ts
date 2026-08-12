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
import { CompleteAssignmentCommand } from "./complete-assignment.command";

@Injectable()
export class CompleteAssignmentHandler extends CommandHandler {
  constructor(
    private readonly assignments: AssignmentRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: ExecutionRequest<CompleteAssignmentCommand>,
  ): Promise<void> {
    const { input: command } = request;
    const assignment = await this.assignments.findById(
      AssignmentId.from(command.assignmentId),
    );
    if (!assignment) throw new AggregateNotFoundException("Assignment");

    assignment.complete();
    await this.execTrxWithDomainEvents(async () => {
      await this.assignments.save(assignment);
    }, assignment);
  }
}
