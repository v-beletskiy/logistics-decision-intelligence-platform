import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Driver } from "../../../../domain-modules/driver/domain/driver.aggregate";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { RegisterDriverCommand } from "./register-driver.command";

@Injectable()
export class RegisterDriverHandler extends CommandHandler {
  constructor(
    private readonly drivers: DriverRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: ExecutionRequest<RegisterDriverCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    return this.execUseCaseTrx(async () => {
      const driver = Driver.register(command.details);
      await this.drivers.add(tenantId, driver);

      return { result: driver.id.value, eventsFrom: [driver] };
    });
  }
}
