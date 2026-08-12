import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { CompartmentId } from "../../../../domain-modules/vehicle/domain/compartment-id";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { RemoveVehicleCompartmentCommand } from "./remove-vehicle-compartment.command";

@Injectable()
export class RemoveVehicleCompartmentHandler extends CommandHandler {
  constructor(
    private readonly vehicles: VehicleRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.VehicleManage)
  async exec(
    request: ExecutionRequest<RemoveVehicleCompartmentCommand>,
  ): Promise<void> {
    const { input: command } = request;
    const vehicle = await this.vehicles.findById(
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    vehicle.removeCompartment(CompartmentId.from(command.compartmentId));
    await this.execTrxWithDomainEvents(async () => {
      await this.vehicles.save(vehicle);
    }, vehicle);
  }
}
