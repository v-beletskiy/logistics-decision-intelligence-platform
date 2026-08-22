import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { DriverCertificationId } from "../../../domain/driver-certification-id";
import { DriverId } from "../../../domain/driver-id";
import { DriverRepository } from "../../../domain/driver.repository";
import { UpdateDriverCertificationCommand } from "./update-driver-certification.command";

@Injectable()
export class UpdateDriverCertificationHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: UseCaseRequest<UpdateDriverCertificationCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    await this.execUseCaseTrx(async () => {
      const loadedDriver = await this.driverRepository.findById(
        tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");

      loadedDriver.aggregate.updateCertification(
        DriverCertificationId.from(command.certificationId),
        command.details,
      );
      await this.driverRepository.save(tenantId, loadedDriver);

      return { result: undefined, eventsFrom: [loadedDriver.aggregate] };
    });
  }
}
