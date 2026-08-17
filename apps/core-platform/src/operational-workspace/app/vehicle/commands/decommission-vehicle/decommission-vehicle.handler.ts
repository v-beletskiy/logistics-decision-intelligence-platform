import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { DecommissionVehicleCommand } from "./decommission-vehicle.command";

@Injectable()
export class DecommissionVehicleHandler extends CommandHandler {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(
    request: ExecutionRequest<DecommissionVehicleCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
    const loadedVehicle = await this.vehicleRepository.findById(
      context.tenantId,
      VehicleId.from(command.vehicleId),
    );
    if (!loadedVehicle) throw new AggregateNotFoundException("Vehicle");

    const vehicle = loadedVehicle.aggregate;

    vehicle.decommission();
      await this.vehicleRepository.save(context.tenantId, loadedVehicle);
      return { result: undefined, eventsFrom: [vehicle] };
    });
  }
}
