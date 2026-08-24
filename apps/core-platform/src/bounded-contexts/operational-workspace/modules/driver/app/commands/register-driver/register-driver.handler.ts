import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { Driver } from "../../../domain/driver.aggregate.js";
import { DriverRepository } from "../../../domain/driver.repository.js";
import { DepotRepository } from "../../../../depot/domain/depot.repository.js";
import { DriverInputMapper } from "../../mappers/driver-input.mapper.js";
import { RegisterDriverCommand } from "./register-driver.command.js";

@Injectable()
export class RegisterDriverHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly depotRepository: DepotRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(request: UseCaseRequest<RegisterDriverCommand>): Promise<string> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    return this.execUseCaseTrx(async () => {
      const details = DriverInputMapper.toRegistrationDetails(command.details);
      if (
        details.depotId !== undefined &&
        !(await this.depotRepository.findById(tenantId, details.depotId))
      ) {
        throw new AggregateNotFoundException("Depot");
      }
      const driver = Driver.register(details);
      await this.driverRepository.add(tenantId, driver);

      return { result: driver.id.value, eventsFrom: [driver] };
    });
  }
}
