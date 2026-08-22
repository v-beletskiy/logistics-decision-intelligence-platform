import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { Driver } from "../../../domain/driver.aggregate";
import { DriverRepository } from "../../../domain/driver.repository";
import { DepotRepository } from "../../../../depot/domain/depot.repository";
import { DriverInputMapper } from "../../mappers/driver-input.mapper";
import { RegisterDriverCommand } from "./register-driver.command";

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
