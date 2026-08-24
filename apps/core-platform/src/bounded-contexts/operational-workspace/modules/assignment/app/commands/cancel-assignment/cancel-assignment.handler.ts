import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { InternalApplicationEventBus } from "../../../../../../../shared/app/messaging/internal-application-event-bus.js";
import { routeInputChangedAppEvent } from "../../../../../public-api/events/route-input-changed.application-event.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { AssignmentId } from "../../../domain/assignment-id.js";
import { AssignmentRepository } from "../../../domain/assignment.repository.js";
import { CancelAssignmentCommand } from "./cancel-assignment.command.js";

@Injectable()
export class CancelAssignmentHandler extends CommandHandler {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly internalApplicationEventBus: InternalApplicationEventBus,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(request: UseCaseRequest<CancelAssignmentCommand>): Promise<void> {
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
