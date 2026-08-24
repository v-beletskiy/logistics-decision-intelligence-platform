import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import {
  AggregateNotFoundException,
  ApplicationInvariantViolationException,
} from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { RouteId } from "../../../domain/route-id.js";
import { RouteRepository } from "../../../domain/route.repository.js";
import { RouteStopRepository } from "../../../domain/route-stop.repository.js";
import { CancelRouteCommand } from "./cancel-route.command.js";

@Injectable()
export class CancelRouteHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(request: UseCaseRequest<CancelRouteCommand>): Promise<void> {
    const { context, input: command } = request;
    await this.execUseCaseTrx(async () => {
      const loadedRoute = await this.routeRepository.findByIdForUpdate(
        context.tenantId,
        RouteId.from(command.routeId),
      );
      if (!loadedRoute) throw new AggregateNotFoundException("Route");

      const activeSequence = loadedRoute.aggregate.activeStopSequence;
      const loadedActiveStop =
        activeSequence === undefined
          ? null
          : await this.routeStopRepository.findByRouteIdAndSequenceForUpdate(
              context.tenantId,
              loadedRoute.aggregate.id,
              activeSequence,
            );
      if (activeSequence !== undefined && !loadedActiveStop) {
        throw new ApplicationInvariantViolationException(
          "An active route stop is missing from persisted data.",
        );
      }

      loadedRoute.aggregate.cancel();
      loadedActiveStop?.aggregate.cancel();
      if (loadedActiveStop) {
        await this.routeStopRepository.save(context.tenantId, loadedActiveStop);
      }
      await this.routeRepository.save(context.tenantId, loadedRoute);

      return {
        result: undefined,
        eventsFrom: loadedActiveStop
          ? [loadedRoute.aggregate, loadedActiveStop.aggregate]
          : [loadedRoute.aggregate],
      };
    });
  }
}
