import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { DepotId } from "../../../../domain-modules/depot/domain/depot-id";
import { CloseDepotCommand } from "./close-depot.command";

@Injectable()
export class CloseDepotHandler extends CommandHandler {
  constructor(
    @Inject(DepotRepository) private readonly depots: DepotRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(command: CloseDepotCommand): Promise<void> {
    const depot = await this.depots.findById(DepotId.from(command.depotId));
    if (!depot) throw new AggregateNotFoundException("Depot");

    depot.close();
    await this.execTrxWithDomainEvents(async () => {
      await this.depots.save(depot);
    }, depot);
  }
}
