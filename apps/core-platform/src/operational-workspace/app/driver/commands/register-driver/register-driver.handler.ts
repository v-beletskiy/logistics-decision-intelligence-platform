import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/infra/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Driver } from "../../../../domain-modules/driver/domain/driver.aggregate";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { RegisterDriverCommand } from "./register-driver.command";

@Injectable()
export class RegisterDriverHandler extends CommandHandler {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(command: RegisterDriverCommand): Promise<string> {
    const driver = Driver.register(command.details);
    await this.execTrxWithDomainEvents(async () => {
      await this.drivers.save(driver);
    }, driver);

    return driver.id.value;
  }
}
