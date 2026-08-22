import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { DepotRepository } from "../../../domain/depot.repository";
import { DepotId } from "../../../domain/depot-id";
import { ActivateDepotCommand } from "./activate-depot.command";

@Injectable()
export class ActivateDepotHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(request: UseCaseRequest<ActivateDepotCommand>): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedDepot = await this.depotRepository.findById(
        context.tenantId,
        DepotId.from(command.depotId),
      );
      if (!loadedDepot) throw new AggregateNotFoundException("Depot");

      const depot = loadedDepot.aggregate;

      depot.activate();
      await this.depotRepository.save(context.tenantId, loadedDepot);
      return { result: undefined, eventsFrom: [depot] };
    });
  }
}
