import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { CancelRouteCommand } from "./cancel-route.command";

@Injectable()
export class CancelRouteHandler extends CommandHandler {
  constructor(
    private readonly routes: RouteRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(
    request: ExecutionRequest<CancelRouteCommand>,
  ): Promise<void> {
    const { input: command } = request;
    const route = await this.routes.findById(RouteId.from(command.routeId));
    if (!route) throw new AggregateNotFoundException("Route");

    route.cancel();
    await this.execTrxWithDomainEvents(async () => {
      await this.routes.save(route);
    }, route);
  }
}
