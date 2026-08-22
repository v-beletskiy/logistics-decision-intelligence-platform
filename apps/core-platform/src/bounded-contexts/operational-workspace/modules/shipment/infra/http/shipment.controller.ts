import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { CurrentUseCaseContext } from "../../../../../../shared/modules/access-control/infra/authentication/current-use-case-context.decorator";
import type { UseCaseContext } from "../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { CancelShipmentCommand } from "../../app/commands/cancel-shipment/cancel-shipment.command";
import { CancelShipmentHandler } from "../../app/commands/cancel-shipment/cancel-shipment.handler";
import { CompleteDeliveryCommand } from "../../app/commands/complete-delivery/complete-delivery.command";
import { CompleteDeliveryHandler } from "../../app/commands/complete-delivery/complete-delivery.handler";
import { CompletePickupCommand } from "../../app/commands/complete-pickup/complete-pickup.command";
import { CompletePickupHandler } from "../../app/commands/complete-pickup/complete-pickup.handler";
import { CreateShipmentCommand } from "../../app/commands/create-shipment/create-shipment.command";
import { CreateShipmentHandler } from "../../app/commands/create-shipment/create-shipment.handler";
import { UpdateShipmentDetailsCommand } from "../../app/commands/update-shipment-details/update-shipment-details.command";
import { UpdateShipmentDetailsHandler } from "../../app/commands/update-shipment-details/update-shipment-details.handler";
import type {
  CreateShipmentRequest,
  CreatedShipmentResponse,
  ShipmentRouteParams,
  UpdateShipmentDetailsRequest,
} from "./shipment.http-contracts";
import { ShipmentHttpMapper } from "./shipment.http-mapper";
import {
  createShipmentRequestPipe,
  shipmentRouteParamsPipe,
  updateShipmentDetailsRequestPipe,
} from "./schemas";

@Controller({ path: "shipments", version: "1" })
export class ShipmentController {
  constructor(
    private readonly createShipmentHandler: CreateShipmentHandler,
    private readonly updateShipmentDetailsHandler: UpdateShipmentDetailsHandler,
    private readonly completePickupHandler: CompletePickupHandler,
    private readonly completeDeliveryHandler: CompleteDeliveryHandler,
    private readonly cancelShipmentHandler: CancelShipmentHandler,
  ) {}

  @Post()
  async create(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Body(createShipmentRequestPipe) request: CreateShipmentRequest,
  ): Promise<CreatedShipmentResponse> {
    const shipmentId = await this.createShipmentHandler.exec({
      context: executionContext,
      input: new CreateShipmentCommand(
        ShipmentHttpMapper.toShipmentDetailsInput(request),
      ),
    });
    return ShipmentHttpMapper.toCreatedShipmentResponse(shipmentId);
  }

  @Put(":shipmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDetails(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(shipmentRouteParamsPipe) params: ShipmentRouteParams,
    @Body(updateShipmentDetailsRequestPipe)
    request: UpdateShipmentDetailsRequest,
  ): Promise<void> {
    return this.updateShipmentDetailsHandler.exec({
      context: executionContext,
      input: new UpdateShipmentDetailsCommand(
        params.shipmentId,
        ShipmentHttpMapper.toShipmentDetailsInput(request),
      ),
    });
  }

  @Put(":shipmentId/pickup")
  @HttpCode(HttpStatus.NO_CONTENT)
  completePickup(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(shipmentRouteParamsPipe) params: ShipmentRouteParams,
  ): Promise<void> {
    return this.completePickupHandler.exec({
      context: executionContext,
      input: new CompletePickupCommand(params.shipmentId),
    });
  }

  @Put(":shipmentId/delivery")
  @HttpCode(HttpStatus.NO_CONTENT)
  completeDelivery(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(shipmentRouteParamsPipe) params: ShipmentRouteParams,
  ): Promise<void> {
    return this.completeDeliveryHandler.exec({
      context: executionContext,
      input: new CompleteDeliveryCommand(params.shipmentId),
    });
  }

  @Put(":shipmentId/cancellation")
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(shipmentRouteParamsPipe) params: ShipmentRouteParams,
  ): Promise<void> {
    return this.cancelShipmentHandler.exec({
      context: executionContext,
      input: new CancelShipmentCommand(params.shipmentId),
    });
  }
}
