import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { MalformedPersistenceDataException } from "../../../../../shared/infra/persistence/persistence.exceptions";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteStopRepository } from "../../../../domain-modules/route/domain/route-stop.repository";
import { CancelRouteCommand } from "./cancel-route.command";

@Injectable()
export class CancelRouteHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(request: ExecutionRequest<CancelRouteCommand>): Promise<void> {
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
        throw new MalformedPersistenceDataException(
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
