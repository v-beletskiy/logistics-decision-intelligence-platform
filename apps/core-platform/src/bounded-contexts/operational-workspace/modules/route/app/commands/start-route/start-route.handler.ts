import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { AssignmentRepository } from "../../../../assignment/domain/assignment.repository";
import { RouteId } from "../../../domain/route-id";
import { RouteRepository } from "../../../domain/route.repository";
import { StartRouteCommand } from "./start-route.command";

@Injectable()
export class StartRouteHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly assignmentRepository: AssignmentRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(request: UseCaseRequest<StartRouteCommand>): Promise<void> {
    const { context, input: command } = request;
    await this.execUseCaseTrx(async () => {
      const loadedRoute = await this.routeRepository.findByIdForUpdate(
        context.tenantId,
        RouteId.from(command.routeId),
      );
      if (!loadedRoute) throw new AggregateNotFoundException("Route");

      const hasRunningAssignment =
        await this.assignmentRepository.existsRunningForRoute(
          context.tenantId,
          loadedRoute.aggregate.id,
        );
      loadedRoute.aggregate.start(hasRunningAssignment);
      await this.routeRepository.save(context.tenantId, loadedRoute);

      return { result: undefined, eventsFrom: [loadedRoute.aggregate] };
    });
  }
}
