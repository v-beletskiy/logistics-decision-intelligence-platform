import { Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { Shipment } from "../../../domain/shipment.aggregate";
import { ShipmentRepository } from "../../../domain/shipment.repository";
import { ShipmentInputMapper } from "../../mappers/shipment-input.mapper";
import { CreateShipmentCommand } from "./create-shipment.command";

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
