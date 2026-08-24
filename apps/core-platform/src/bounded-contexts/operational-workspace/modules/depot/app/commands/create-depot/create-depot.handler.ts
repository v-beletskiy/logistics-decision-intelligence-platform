import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { Depot } from "../../../domain/depot.aggregate.js";
import { DepotRepository } from "../../../domain/depot.repository.js";
import { CreateDepotCommand } from "./create-depot.command.js";

@Injectable()
export class CreateDepotHandler extends CommandHandler {
  constructor(
    private readonly depotRepository: DepotRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DepotManage)
  async exec(request: UseCaseRequest<CreateDepotCommand>): Promise<string> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const depot = Depot.create(
        command.details,
        command.vehicleCapacity,
        command.driverCapacity,
      );
      await this.depotRepository.add(context.tenantId, depot);
      return { result: depot.id.value, eventsFrom: [depot] };
    });
  }
}
