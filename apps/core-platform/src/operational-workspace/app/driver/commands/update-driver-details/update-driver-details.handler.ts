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
import { DepotRepository } from "../../../../domain-modules/depot/domain/depot.repository";
import { DriverInputMapper } from "../../mappers/driver-input.mapper";
import { UpdateDriverDetailsCommand } from "./update-driver-details.command";

@Injectable()
export class UpdateDriverDetailsHandler extends CommandHandler {
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
    request: ExecutionRequest<UpdateDriverDetailsCommand>,
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
