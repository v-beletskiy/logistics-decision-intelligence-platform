import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { ShipmentId } from "../../../../domain-modules/shipment/domain/shipment-id";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { UpdateShipmentDetailsCommand } from "./update-shipment-details.command";

@Injectable()
export class UpdateShipmentDetailsHandler extends CommandHandler {
  constructor(
    private readonly shipments: ShipmentRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.ShipmentManage)
  async exec(
    request: ExecutionRequest<UpdateShipmentDetailsCommand>,
  ): Promise<void> {
    const { input: command } = request;
    const shipment = await this.shipments.findById(
      ShipmentId.from(command.shipmentId),
    );
    if (!shipment) throw new AggregateNotFoundException("Shipment");

    shipment.updateDetails(command.details);
    await this.execTrxWithDomainEvents(async () => {
      await this.shipments.save(shipment);
    }, shipment);
  }
}
