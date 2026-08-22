import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { Depot } from "../../../domain/depot.aggregate";
import { DepotRepository } from "../../../domain/depot.repository";
import { CreateDepotCommand } from "./create-depot.command";

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
