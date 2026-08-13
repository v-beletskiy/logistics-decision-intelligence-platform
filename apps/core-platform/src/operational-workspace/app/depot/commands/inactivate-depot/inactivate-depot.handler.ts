import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { DepotId } from "../../../../domain-modules/depot/domain/depot-id";
import { InactivateDepotCommand } from "./inactivate-depot.command";

@Injectable()
export class InactivateDepotHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(
    request: ExecutionRequest<InactivateDepotCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    const depot = await this.depotRepository.findById(
      context.tenantId,
      DepotId.from(command.depotId),
    );
    if (!depot) throw new AggregateNotFoundException("Depot");

    depot.inactivate();
    await this.execTrxWithDomainEvents(async () => {
      await this.depotRepository.save(context.tenantId, depot);
    }, depot);
  }
}
