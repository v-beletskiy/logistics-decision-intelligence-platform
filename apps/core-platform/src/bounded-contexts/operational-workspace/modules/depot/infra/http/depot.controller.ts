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
import { ActivateDepotCommand } from "../../app/commands/activate-depot/activate-depot.command";
import { ActivateDepotHandler } from "../../app/commands/activate-depot/activate-depot.handler";
import { CloseDepotCommand } from "../../app/commands/close-depot/close-depot.command";
import { CloseDepotHandler } from "../../app/commands/close-depot/close-depot.handler";
import { CreateDepotCommand } from "../../app/commands/create-depot/create-depot.command";
import { CreateDepotHandler } from "../../app/commands/create-depot/create-depot.handler";
import { InactivateDepotCommand } from "../../app/commands/inactivate-depot/inactivate-depot.command";
import { InactivateDepotHandler } from "../../app/commands/inactivate-depot/inactivate-depot.handler";
import { UpdateDepotDetailsCommand } from "../../app/commands/update-depot-details/update-depot-details.command";
import { UpdateDepotDetailsHandler } from "../../app/commands/update-depot-details/update-depot-details.handler";
import { UpdateDepotDriverCapacityCommand } from "../../app/commands/update-depot-driver-capacity/update-depot-driver-capacity.command";
import { UpdateDepotDriverCapacityHandler } from "../../app/commands/update-depot-driver-capacity/update-depot-driver-capacity.handler";
import { UpdateDepotVehicleCapacityCommand } from "../../app/commands/update-depot-vehicle-capacity/update-depot-vehicle-capacity.command";
import { UpdateDepotVehicleCapacityHandler } from "../../app/commands/update-depot-vehicle-capacity/update-depot-vehicle-capacity.handler";
import type {
  CreateDepotRequest,
  CreatedDepotResponse,
  DepotRouteParams,
  UpdateDepotDetailsRequest,
  UpdateDepotDriverCapacityRequest,
  UpdateDepotVehicleCapacityRequest,
} from "./depot.http-contracts";
import { DepotHttpMapper } from "./depot.http-mapper";
import {
  createDepotRequestPipe,
  depotRouteParamsPipe,
  updateDepotDetailsRequestPipe,
  updateDepotDriverCapacityRequestPipe,
  updateDepotVehicleCapacityRequestPipe,
} from "./schemas";

@Controller({ path: "depots", version: "1" })
export class DepotController {
  constructor(
    private readonly createDepotHandler: CreateDepotHandler,
    private readonly updateDepotDetailsHandler: UpdateDepotDetailsHandler,
    private readonly updateDepotVehicleCapacityHandler: UpdateDepotVehicleCapacityHandler,
    private readonly updateDepotDriverCapacityHandler: UpdateDepotDriverCapacityHandler,
    private readonly activateDepotHandler: ActivateDepotHandler,
    private readonly inactivateDepotHandler: InactivateDepotHandler,
    private readonly closeDepotHandler: CloseDepotHandler,
  ) {}

  @Post()
  async create(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Body(createDepotRequestPipe) request: CreateDepotRequest,
  ): Promise<CreatedDepotResponse> {
    const depotId = await this.createDepotHandler.exec({
      context: executionContext,
      input: new CreateDepotCommand(
        DepotHttpMapper.toDepotDetailsInput(request),
        request.vehicleCapacity,
        request.driverCapacity,
      ),
    });
    return DepotHttpMapper.toCreatedDepotResponse(depotId);
  }

  @Put(":depotId")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDetails(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(depotRouteParamsPipe) params: DepotRouteParams,
    @Body(updateDepotDetailsRequestPipe)
    request: UpdateDepotDetailsRequest,
  ): Promise<void> {
    return this.updateDepotDetailsHandler.exec({
      context: executionContext,
      input: new UpdateDepotDetailsCommand(
        params.depotId,
        DepotHttpMapper.toDepotDetailsInput(request),
      ),
    });
  }

  @Put(":depotId/vehicle-capacity")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateVehicleCapacity(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(depotRouteParamsPipe) params: DepotRouteParams,
    @Body(updateDepotVehicleCapacityRequestPipe)
    request: UpdateDepotVehicleCapacityRequest,
  ): Promise<void> {
    return this.updateDepotVehicleCapacityHandler.exec({
      context: executionContext,
      input: new UpdateDepotVehicleCapacityCommand(
        params.depotId,
        request.vehicleCapacity,
      ),
    });
  }

  @Put(":depotId/driver-capacity")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDriverCapacity(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(depotRouteParamsPipe) params: DepotRouteParams,
    @Body(updateDepotDriverCapacityRequestPipe)
    request: UpdateDepotDriverCapacityRequest,
  ): Promise<void> {
    return this.updateDepotDriverCapacityHandler.exec({
      context: executionContext,
      input: new UpdateDepotDriverCapacityCommand(
        params.depotId,
        request.driverCapacity,
      ),
    });
  }

  @Put(":depotId/activation")
  @HttpCode(HttpStatus.NO_CONTENT)
  activate(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(depotRouteParamsPipe) params: DepotRouteParams,
  ): Promise<void> {
    return this.activateDepotHandler.exec({
      context: executionContext,
      input: new ActivateDepotCommand(params.depotId),
    });
  }

  @Put(":depotId/inactivation")
  @HttpCode(HttpStatus.NO_CONTENT)
  inactivate(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(depotRouteParamsPipe) params: DepotRouteParams,
  ): Promise<void> {
    return this.inactivateDepotHandler.exec({
      context: executionContext,
      input: new InactivateDepotCommand(params.depotId),
    });
  }

  @Put(":depotId/closure")
  @HttpCode(HttpStatus.NO_CONTENT)
  close(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(depotRouteParamsPipe) params: DepotRouteParams,
  ): Promise<void> {
    return this.closeDepotHandler.exec({
      context: executionContext,
      input: new CloseDepotCommand(params.depotId),
    });
  }
}
