import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { RouteId } from "../../../domain/route-id";
import { RouteRepository } from "../../../domain/route.repository";
import { CompleteRouteCommand } from "./complete-route.command";

@Injectable()
export class CompleteRouteHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(request: UseCaseRequest<CompleteRouteCommand>): Promise<void> {
    const { context, input: command } = request;
    await this.execUseCaseTrx(async () => {
      const loadedRoute = await this.routeRepository.findByIdForUpdate(
        context.tenantId,
        RouteId.from(command.routeId),
      );
      if (!loadedRoute) throw new AggregateNotFoundException("Route");

      loadedRoute.aggregate.complete();
      await this.routeRepository.save(context.tenantId, loadedRoute);

      return { result: undefined, eventsFrom: [loadedRoute.aggregate] };
    });
  }
}
