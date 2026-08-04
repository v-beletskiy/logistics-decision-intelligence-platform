import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/infra/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { ChangeDriverAvailabilityCommand } from "./change-driver-availability.command";

@Injectable()
export class ChangeDriverAvailabilityHandler extends CommandHandler {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(command: ChangeDriverAvailabilityCommand): Promise<void> {
    const driver = await this.drivers.findById(DriverId.from(command.driverId));
    if (!driver) throw new AggregateNotFoundException("Driver");

    if (command.available) {
      driver.markAvailable();
    } else {
      driver.markUnavailable();
    }
    await this.execTrxWithDomainEvents(async () => {
      await this.drivers.save(driver);
    }, driver);
  }
}
