import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { AddVehicleCompartmentCommand } from "./add-vehicle-compartment.command";

@Injectable()
export class AddVehicleCompartmentHandler extends CommandHandler {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(
    request: ExecutionRequest<AddVehicleCompartmentCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    const vehicle = await this.vehicleRepository.findById(
      context.tenantId,
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    const compartmentId = vehicle.addCompartment(command.details);
    await this.execTrxWithDomainEvents(async () => {
      await this.vehicleRepository.save(context.tenantId, vehicle);
    }, vehicle);

    return compartmentId.value;
  }
}
