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
import { CloseDepotCommand } from "./close-depot.command";

@Injectable()
export class CloseDepotHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(
    request: ExecutionRequest<CloseDepotCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
    const loadedDepot = await this.depotRepository.findById(
      context.tenantId,
      DepotId.from(command.depotId),
    );
    if (!loadedDepot) throw new AggregateNotFoundException("Depot");

    const depot = loadedDepot.aggregate;

    depot.close();
      await this.depotRepository.save(context.tenantId, loadedDepot);
      return { result: undefined, eventsFrom: [depot] };
    });
  }
}
