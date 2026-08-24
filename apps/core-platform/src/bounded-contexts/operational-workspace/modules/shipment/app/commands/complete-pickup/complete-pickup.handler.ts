import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { ShipmentId } from "../../../domain/shipment-id.js";
import { ShipmentRepository } from "../../../domain/shipment.repository.js";
import { CompletePickupCommand } from "./complete-pickup.command.js";

@Injectable()
export class CompletePickupHandler extends CommandHandler {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.ShipmentManage)
  async exec(request: UseCaseRequest<CompletePickupCommand>): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedShipment = await this.shipmentRepository.findById(
        context.tenantId,
        ShipmentId.from(command.shipmentId),
      );
      if (!loadedShipment) throw new AggregateNotFoundException("Shipment");

      const shipment = loadedShipment.aggregate;
      shipment.completePickup();
      await this.shipmentRepository.save(context.tenantId, loadedShipment);
      return { result: undefined, eventsFrom: [shipment] };
    });
  }
}
