import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { DepotId } from "../../../../domain-modules/depot/domain/depot-id";
import { UpdateDepotDriverCapacityCommand } from "./update-depot-driver-capacity.command";

@Injectable()
export class UpdateDepotDriverCapacityHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(
    request: ExecutionRequest<UpdateDepotDriverCapacityCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
    const loadedDepot = await this.depotRepository.findById(
      context.tenantId,
      DepotId.from(command.depotId),
    );
    if (!loadedDepot) throw new AggregateNotFoundException("Depot");

    const depot = loadedDepot.aggregate;

    depot.updateDriverCapacity(command.driverCapacity);
      await this.depotRepository.save(context.tenantId, loadedDepot);
      return { result: undefined, eventsFrom: [depot] };
    });
  }
}
