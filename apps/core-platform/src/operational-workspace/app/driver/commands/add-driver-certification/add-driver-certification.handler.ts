import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { AddDriverCertificationCommand } from "./add-driver-certification.command";

@Injectable()
export class AddDriverCertificationHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: ExecutionRequest<AddDriverCertificationCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    return this.execUseCaseTrx(async () => {
      const loadedDriver = await this.driverRepository.findById(
        tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");

      const certificationId = loadedDriver.aggregate.addCertification(
        command.details,
      );
      await this.driverRepository.save(tenantId, loadedDriver);

      return {
        result: certificationId.value,
        eventsFrom: [loadedDriver.aggregate],
      };
    });
  }
}
