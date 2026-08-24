import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { Vehicle } from "../../../domain/vehicle.aggregate.js";
import { VehicleRepository } from "../../../domain/vehicle.repository.js";
import { VehicleInputMapper } from "../../mappers/vehicle-input.mapper.js";
import { RegisterVehicleCommand } from "./register-vehicle.command.js";

@Injectable()
export class RegisterVehicleHandler extends CommandHandler {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(request: UseCaseRequest<RegisterVehicleCommand>): Promise<string> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const vehicle = Vehicle.register(
        VehicleInputMapper.toRegistrationDetails(command.details),
      );
      await this.vehicleRepository.add(context.tenantId, vehicle);
      return { result: vehicle.id.value, eventsFrom: [vehicle] };
    });
  }
}
