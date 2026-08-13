import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Shipment } from "../../../../domain-modules/shipment/domain/shipment.aggregate";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { CreateShipmentCommand } from "./create-shipment.command";

@Injectable()
export class CreateShipmentHandler extends CommandHandler {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.ShipmentManage)
  async exec(
    request: ExecutionRequest<CreateShipmentCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const shipment = Shipment.create(command.details);
      await this.shipmentRepository.add(context.tenantId, shipment);
      return { result: shipment.id.value, eventsFrom: [shipment] };
    });
  }
}
