import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteStopRepository } from "../../../../domain-modules/route/domain/route-stop.repository";
import { RecordRouteStopArrivalCommand } from "./record-route-stop-arrival.command";

@Injectable()
export class RecordRouteStopArrivalHandler extends CommandHandler {
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
    request: ExecutionRequest<RecordRouteStopArrivalCommand>,
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

      loadedRoute.aggregate.assertCanRecordStopArrival(
        loadedStop.aggregate.sequence,
      );
      loadedStop.aggregate.recordArrival(command.arrivedAt);
      await this.routeStopRepository.save(context.tenantId, loadedStop);

      return { result: undefined, eventsFrom: [loadedStop.aggregate] };
    });
  }
}
