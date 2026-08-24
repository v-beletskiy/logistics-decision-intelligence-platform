import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { DepotRepository } from "../../../domain/depot.repository.js";
import { DepotId } from "../../../domain/depot-id.js";
import { UpdateDepotDriverCapacityCommand } from "./update-depot-driver-capacity.command.js";

@Injectable()
export class UpdateDepotDriverCapacityHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(
    request: UseCaseRequest<UpdateDepotDriverCapacityCommand>,
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
