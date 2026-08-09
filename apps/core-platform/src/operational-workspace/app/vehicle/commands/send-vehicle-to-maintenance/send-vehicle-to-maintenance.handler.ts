import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { SendVehicleToMaintenanceCommand } from "./send-vehicle-to-maintenance.command";

@Injectable()
export class SendVehicleToMaintenanceHandler extends CommandHandler {
  constructor(
    @Inject(VehicleRepository) private readonly vehicles: VehicleRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(command: SendVehicleToMaintenanceCommand): Promise<void> {
    const vehicle = await this.vehicles.findById(
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    vehicle.sendToMaintenance();
    await this.execTrxWithDomainEvents(async () => {
      await this.vehicles.save(vehicle);
    }, vehicle);
  }
}
