import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { Shipment } from "../../../domain/shipment.aggregate.js";
import { ShipmentRepository } from "../../../domain/shipment.repository.js";
import { ShipmentInputMapper } from "../../mappers/shipment-input.mapper.js";
import { CreateShipmentCommand } from "./create-shipment.command.js";

@Injectable()
export class CreateShipmentHandler extends CommandHandler {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.ShipmentManage)
  async exec(request: UseCaseRequest<CreateShipmentCommand>): Promise<string> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const shipment = Shipment.create(
        ShipmentInputMapper.toDetails(command.details),
      );
      await this.shipmentRepository.add(context.tenantId, shipment);
      return { result: shipment.id.value, eventsFrom: [shipment] };
    });
  }
}
