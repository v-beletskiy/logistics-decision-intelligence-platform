import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/infra/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Depot } from "../../../../domain-modules/depot/domain/depot.aggregate";
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { CreateDepotCommand } from "./create-depot.command";

@Injectable()
export class CreateDepotHandler extends CommandHandler {
  constructor(
    @Inject(DepotRepository) private readonly depots: DepotRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(command: CreateDepotCommand): Promise<string> {
    const depot = Depot.create(command.details, command.vehicleCapacity, command.driverCapacity);
    await this.execTrxWithDomainEvents(async () => {
      await this.depots.save(depot);
    }, depot);

    return depot.id.value;
  }
}
