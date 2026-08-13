import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Vehicle } from "../../../../domain-modules/vehicle/domain/vehicle.aggregate";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { RegisterVehicleCommand } from "./register-vehicle.command";

@Injectable()
export class RegisterVehicleHandler extends CommandHandler {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(
    request: ExecutionRequest<RegisterVehicleCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    const vehicle = Vehicle.register(command.details);
    await this.execTrxWithDomainEvents(async () => {
      await this.vehicleRepository.save(context.tenantId, vehicle);
    }, vehicle);

    return vehicle.id.value;
  }
}
