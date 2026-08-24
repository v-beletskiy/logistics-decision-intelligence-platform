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
import { Route } from "../../../domain/route.aggregate.js";
import { RouteStop } from "../../../domain/route-stop.aggregate.js";
import { RouteRepository } from "../../../domain/route.repository.js";
import { RouteStopRepository } from "../../../domain/route-stop.repository.js";
import { ShipmentRepository } from "../../../../shipment/domain/shipment.repository.js";
import { RoutePlanningPolicy } from "../../../domain/route-planning.policy.js";
import { RouteInputMapper } from "../../mappers/route-input.mapper.js";
import { CreateRouteCommand } from "./create-route.command.js";

@Injectable()
export class CreateRouteHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    private readonly shipmentRepository: ShipmentRepository,
    private readonly routePlanningPolicy: RoutePlanningPolicy,
    private readonly internalApplicationEventBus: InternalApplicationEventBus,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(request: UseCaseRequest<CreateRouteCommand>): Promise<string> {
    const { context, input: command } = request;
    const routeId = await this.execUseCaseTrx(async () => {
      const stopDetails = command.stops.map((stop) =>
        RouteInputMapper.toStopPlan(stop),
      );
      const shipmentIds = [
        ...new Map(
          stopDetails.map((stop) => [stop.shipmentId.value, stop.shipmentId]),
        ).values(),
      ];
      const shipments = await this.shipmentRepository.findByIds(
        context.tenantId,
        shipmentIds,
      );
      if (shipments.length !== shipmentIds.length) {
        throw new AggregateNotFoundException(
          "One or more route shipments do not exist.",
        );
      }

      this.routePlanningPolicy.assertCanCreate(stopDetails);
      const route = Route.create({ plannedStopCount: stopDetails.length });
      const stops = stopDetails.map((stop, index) =>
        RouteStop.create({
          ...stop,
          routeId: route.id,
          sequence: index + 1,
        }),
      );
      await this.routeRepository.add(context.tenantId, route);
      await this.routeStopRepository.addMany(context.tenantId, stops);

      await this.internalApplicationEventBus.publish(
        routeInputChangedAppEvent({
          routeId: route.id.value,
          tenantId: context.tenantId,
        }),
      );

      return { result: route.id.value, eventsFrom: [route] };
    });

    return routeId;
  }
}
