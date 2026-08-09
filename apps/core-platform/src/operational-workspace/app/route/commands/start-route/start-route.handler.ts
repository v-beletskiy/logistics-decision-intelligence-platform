import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { StartRouteCommand } from "./start-route.command";

@Injectable()
export class StartRouteHandler extends CommandHandler {
  constructor(
    private readonly routes: RouteRepository,
    private readonly assignments: AssignmentRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.RouteUpdate)
  async exec(command: StartRouteCommand): Promise<void> {
    const route = await this.routes.findById(RouteId.from(command.routeId));
    if (!route) throw new AggregateNotFoundException("Route");

    const hasRunningAssignment = await this.assignments.existsRunningForRoute(
      route.id,
    );
    route.start(hasRunningAssignment);

    await this.execTrxWithDomainEvents(async () => {
      await this.routes.save(route);
    }, route);
  }
}
