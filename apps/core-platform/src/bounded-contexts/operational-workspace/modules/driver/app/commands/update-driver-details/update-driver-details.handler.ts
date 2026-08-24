import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { DriverRepository } from "../../../domain/driver.repository.js";
import { DriverId } from "../../../domain/driver-id.js";
import { DepotRepository } from "../../../../depot/domain/depot.repository.js";
import { DriverInputMapper } from "../../mappers/driver-input.mapper.js";
import { UpdateDriverDetailsCommand } from "./update-driver-details.command.js";

@Injectable()
export class UpdateDriverDetailsHandler extends CommandHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly depotRepository: DepotRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.DriverManage)
  async exec(
    request: UseCaseRequest<UpdateDriverDetailsCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    const tenantId = context.tenantId;
    await this.execUseCaseTrx(async () => {
      const loadedDriver = await this.driverRepository.findById(
        tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");

      const details = DriverInputMapper.toDetails(command.details);
      if (
        details.depotId !== undefined &&
        !(await this.depotRepository.findById(tenantId, details.depotId))
      ) {
        throw new AggregateNotFoundException("Depot");
      }
      loadedDriver.aggregate.updateDetails(details);
      await this.driverRepository.save(tenantId, loadedDriver);

      return { result: undefined, eventsFrom: [loadedDriver.aggregate] };
    });
  }
}
