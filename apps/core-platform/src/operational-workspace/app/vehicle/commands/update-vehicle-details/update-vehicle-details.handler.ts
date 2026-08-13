import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleInputMapper } from "../../mappers/vehicle-input.mapper";
import { UpdateVehicleDetailsCommand } from "./update-vehicle-details.command";

@Injectable()
export class UpdateVehicleDetailsHandler extends CommandHandler {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(
    request: ExecutionRequest<UpdateVehicleDetailsCommand>,
  ): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedVehicle = await this.vehicleRepository.findById(
        context.tenantId,
        VehicleId.from(command.vehicleId),
      );
      if (!loadedVehicle) throw new AggregateNotFoundException("Vehicle");

      const vehicle = loadedVehicle.aggregate;

      vehicle.updateDetails(VehicleInputMapper.toDetails(command.details));
      await this.vehicleRepository.save(context.tenantId, loadedVehicle);
      return { result: undefined, eventsFrom: [vehicle] };
    });
  }
}
