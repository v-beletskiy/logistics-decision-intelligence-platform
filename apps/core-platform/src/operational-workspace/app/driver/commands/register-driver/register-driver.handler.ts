import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Driver } from "../../../../domain-modules/driver/domain/driver.aggregate";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { DriverInputMapper } from "../../mappers/driver-input.mapper";
import { RegisterDriverCommand } from "./register-driver.command";

@Injectable()
export class RegisterDriverHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly depotRepository: DepotRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: ExecutionRequest<RegisterDriverCommand>,
  ): Promise<string> {
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
