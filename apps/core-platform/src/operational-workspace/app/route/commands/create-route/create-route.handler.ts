import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Route } from "../../../../domain-modules/route/domain/route.aggregate";
import { RouteStop } from "../../../../domain-modules/route/domain/route-stop.aggregate";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteStopRepository } from "../../../../domain-modules/route/domain/route-stop.repository";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { RoutePlanningPolicy } from "../../../../domain-modules/route/domain/policies/route-planning.policy";
import { RouteInputMapper } from "../../mappers/route-input.mapper";
import { CreateRouteCommand } from "./create-route.command";

@Injectable()
export class CreateRouteHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    private readonly shipmentRepository: ShipmentRepository,
    private readonly routePlanningPolicy: RoutePlanningPolicy,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(request: ExecutionRequest<CreateRouteCommand>): Promise<string> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const stopDetails = command.stops.map((stop) =>
        RouteInputMapper.toStopDetails(stop),
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

      return { result: route.id.value, eventsFrom: [route] };
    });
  }
}
