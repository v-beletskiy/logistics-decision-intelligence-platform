import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { ReinstateDriverCommand } from "./reinstate-driver.command";

@Injectable()
export class ReinstateDriverHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: ExecutionRequest<ReinstateDriverCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    await this.execUseCaseTrx(async () => {
      const loadedDriver = await this.driverRepository.findById(
        tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");

      loadedDriver.aggregate.reinstate();
      await this.driverRepository.save(tenantId, loadedDriver);

      return { result: undefined, eventsFrom: [loadedDriver.aggregate] };
    });
  }
}
