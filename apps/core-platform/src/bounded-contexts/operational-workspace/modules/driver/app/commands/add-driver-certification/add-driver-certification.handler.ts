import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { DriverId } from "../../../domain/driver-id";
import { DriverRepository } from "../../../domain/driver.repository";
import { AddDriverCertificationCommand } from "./add-driver-certification.command";

@Injectable()
export class AddDriverCertificationHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: UseCaseRequest<AddDriverCertificationCommand>,
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
