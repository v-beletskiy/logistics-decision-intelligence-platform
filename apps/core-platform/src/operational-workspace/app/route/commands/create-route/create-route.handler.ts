import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/infra/messaging/domain-event-bus";
import { InternalApplicationEventBus } from "../../../../../shared/infra/messaging/application-event-bus";
import { IntegrationEventMetadataFactory } from "../../../../../shared/infra/messaging/integration-event.factory";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Route } from "../../../../domain-modules/route/domain/route.aggregate";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { CreateRouteCommand } from "./create-route.command";

@Injectable()
export class CreateRouteHandler extends CommandHandler {
  constructor(
    @Inject(RouteRepository) private readonly routes: RouteRepository,
    @Inject(ShipmentRepository) private readonly shipments: ShipmentRepository,
    private readonly internalAppEventBus: InternalApplicationEventBus,
    private readonly integrationEventFactory: IntegrationEventMetadataFactory,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(command: CreateRouteCommand): Promise<string> {
    const shipmentIds = [
      ...new Set(command.stops.map((stop) => stop.shipmentId)),
    ];
    const shipments = await this.shipments.findByIds(shipmentIds);
    if (shipments.length !== shipmentIds.length) {
      throw new AggregateNotFoundException(
        "One or more route shipments do not exist.",
      );
    }

    const route = Route.create({ stops: command.stops });
    await this.execTrxWithDomainEvents(async () => {
      await this.routes.save(route);
      await this.internalAppEventBus.publish(
        this.integrationEventFactory.create({
          eventType: "operational-workspace.route.created",
          eventVersion: 1,
          tenantId: command.tenantId,
          initiatedByUserId: command.initiatedByUserId,
          payload: { routeId: route.id.value },
        }),
      );
    }, route);

    return route.id.value;
  }
}
