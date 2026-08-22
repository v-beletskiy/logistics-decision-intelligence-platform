import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { ShipmentId } from "../../../domain/shipment-id";
import { ShipmentRepository } from "../../../domain/shipment.repository";
import { CancelShipmentCommand } from "./cancel-shipment.command";

@Injectable()
export class CancelShipmentHandler extends CommandHandler {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.ShipmentManage)
  async exec(request: UseCaseRequest<CancelShipmentCommand>): Promise<void> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedShipment = await this.shipmentRepository.findById(
        context.tenantId,
        ShipmentId.from(command.shipmentId),
      );
      if (!loadedShipment) throw new AggregateNotFoundException("Shipment");

      const shipment = loadedShipment.aggregate;
      shipment.cancel();
      await this.shipmentRepository.save(context.tenantId, loadedShipment);
      return { result: undefined, eventsFrom: [shipment] };
    });
  }
}
