import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Depot } from "../../../../domain-modules/depot/domain/depot.aggregate";
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { CreateDepotCommand } from "./create-depot.command";

@Injectable()
export class CreateDepotHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(
    request: ExecutionRequest<CreateDepotCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    const depot = Depot.create(command.details, command.vehicleCapacity, command.driverCapacity);
    await this.execTrxWithDomainEvents(async () => {
      await this.depotRepository.save(context.tenantId, depot);
    }, depot);

    return depot.id.value;
  }
}
