import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { VehicleRepository } from "../../../domain/vehicle.repository";
import { VehicleId } from "../../../domain/vehicle-id";
import { SendVehicleToMaintenanceCommand } from "./send-vehicle-to-maintenance.command";

@Injectable()
export class SendVehicleToMaintenanceHandler extends CommandHandler {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(
    request: UseCaseRequest<SendVehicleToMaintenanceCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedVehicle = await this.vehicleRepository.findById(
        context.tenantId,
        VehicleId.from(command.vehicleId),
      );
      if (!loadedVehicle) throw new AggregateNotFoundException("Vehicle");

      const vehicle = loadedVehicle.aggregate;

      vehicle.sendToMaintenance();
      await this.vehicleRepository.save(context.tenantId, loadedVehicle);
      return { result: undefined, eventsFrom: [vehicle] };
    });
  }
}
