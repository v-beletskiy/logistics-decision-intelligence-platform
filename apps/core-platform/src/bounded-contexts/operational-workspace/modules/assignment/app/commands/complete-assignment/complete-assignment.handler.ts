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
import { CompleteAssignmentCommand } from "./complete-assignment.command";

@Injectable()
export class CompleteAssignmentHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: UseCaseRequest<CompleteAssignmentCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedAssignment = await this.assignmentRepository.findById(
        context.tenantId,
        AssignmentId.from(command.assignmentId),
      );
      if (!loadedAssignment) throw new AggregateNotFoundException("Assignment");

      const assignment = loadedAssignment.aggregate;

      assignment.complete();
      await this.assignmentRepository.save(context.tenantId, loadedAssignment);
      return { result: undefined, eventsFrom: [assignment] };
    });
  }
}
