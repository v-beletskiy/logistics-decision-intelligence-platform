import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { RouteId } from "../../../domain/route-id.js";
import { RouteRepository } from "../../../domain/route.repository.js";
import { RouteStopRepository } from "../../../domain/route-stop.repository.js";
import { RecordRouteStopArrivalCommand } from "./record-route-stop-arrival.command.js";

@Injectable()
export class RecordRouteStopArrivalHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(
    request: UseCaseRequest<RecordRouteStopArrivalCommand>,
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
