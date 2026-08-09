import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { CompleteRouteCommand } from "./complete-route.command";

@Injectable()
export class CompleteRouteHandler extends CommandHandler {
  constructor(
    private readonly routes: RouteRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(command: CompleteRouteCommand): Promise<void> {
    const route = await this.routes.findById(RouteId.from(command.routeId));
    if (!route) throw new AggregateNotFoundException("Route");

    route.complete();
    await this.execTrxWithDomainEvents(async () => {
      await this.routes.save(route);
    }, route);
  }
}
