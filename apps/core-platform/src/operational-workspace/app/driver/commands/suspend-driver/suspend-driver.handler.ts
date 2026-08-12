import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { SuspendDriverCommand } from "./suspend-driver.command";

@Injectable()
export class SuspendDriverHandler extends CommandHandler {
  constructor(
    private readonly drivers: DriverRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: ExecutionRequest<SuspendDriverCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    await this.execUseCaseTrx(async () => {
      const loadedDriver = await this.drivers.findById(
        tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");

      loadedDriver.aggregate.suspend();
      await this.drivers.save(tenantId, loadedDriver);

      return { result: undefined, eventsFrom: [loadedDriver.aggregate] };
    });
  }
}
