import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteStopRepository } from "../../../../domain-modules/route/domain/route-stop.repository";
import { RecordRouteStopDepartureCommand } from "./record-route-stop-departure.command";

@Injectable()
export class RecordRouteStopDepartureHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(
    request: ExecutionRequest<RecordRouteStopDepartureCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    await this.execUseCaseTrx(async () => {
      const loadedRoute = await this.routeRepository.findByIdForUpdate(
        context.tenantId,
        RouteId.from(command.routeId),
      );
      if (!loadedRoute) throw new AggregateNotFoundException("Route");

      const loadedStop =
        await this.routeStopRepository.findByRouteIdAndSequenceForUpdate(
          context.tenantId,
          loadedRoute.aggregate.id,
          command.sequence,
        );
      if (!loadedStop) throw new AggregateNotFoundException("Route stop");

      loadedStop.aggregate.recordDeparture(command.departedAt);
      loadedRoute.aggregate.completeStop(loadedStop.aggregate.sequence);
      await this.routeStopRepository.save(context.tenantId, loadedStop);
      await this.routeRepository.save(context.tenantId, loadedRoute);

      return {
        result: undefined,
        eventsFrom: [loadedRoute.aggregate, loadedStop.aggregate],
      };
    });
  }
}
