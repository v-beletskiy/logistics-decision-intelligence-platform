import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Shipment } from "../../../../domain-modules/shipment/domain/shipment.aggregate";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { CreateShipmentCommand } from "./create-shipment.command";

@Injectable()
export class CreateShipmentHandler extends CommandHandler {
  constructor(
    private readonly shipments: ShipmentRepository,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.ShipmentManage)
  async exec(command: CreateShipmentCommand): Promise<string> {
    const shipment = Shipment.create(command.details);
    await this.execTrxWithDomainEvents(async () => {
      await this.shipments.save(shipment);
    }, shipment);

    return shipment.id.value;
  }
}
