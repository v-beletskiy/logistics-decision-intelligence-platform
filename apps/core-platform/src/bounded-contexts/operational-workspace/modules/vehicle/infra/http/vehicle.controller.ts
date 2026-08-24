import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { CurrentUseCaseContext } from "../../../../../../shared/modules/access-control/infra/authentication/current-use-case-context.decorator.js";
import type { UseCaseContext } from "../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { AddVehicleCompartmentCommand } from "../../app/commands/add-vehicle-compartment/add-vehicle-compartment.command.js";
import { AddVehicleCompartmentHandler } from "../../app/commands/add-vehicle-compartment/add-vehicle-compartment.handler.js";
import { ChangeVehicleAvailabilityCommand } from "../../app/commands/change-vehicle-availability/change-vehicle-availability.command.js";
import { ChangeVehicleAvailabilityHandler } from "../../app/commands/change-vehicle-availability/change-vehicle-availability.handler.js";
import { DecommissionVehicleCommand } from "../../app/commands/decommission-vehicle/decommission-vehicle.command.js";
import { DecommissionVehicleHandler } from "../../app/commands/decommission-vehicle/decommission-vehicle.handler.js";
import { RegisterVehicleCommand } from "../../app/commands/register-vehicle/register-vehicle.command.js";
import { RegisterVehicleHandler } from "../../app/commands/register-vehicle/register-vehicle.handler.js";
import { RemoveVehicleCompartmentCommand } from "../../app/commands/remove-vehicle-compartment/remove-vehicle-compartment.command.js";
import { RemoveVehicleCompartmentHandler } from "../../app/commands/remove-vehicle-compartment/remove-vehicle-compartment.handler.js";
import { ReturnVehicleFromMaintenanceCommand } from "../../app/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.command.js";
import { ReturnVehicleFromMaintenanceHandler } from "../../app/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.handler.js";
import { SendVehicleToMaintenanceCommand } from "../../app/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.command.js";
import { SendVehicleToMaintenanceHandler } from "../../app/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.handler.js";
import { UpdateVehicleCompartmentCommand } from "../../app/commands/update-vehicle-compartment/update-vehicle-compartment.command.js";
import { UpdateVehicleCompartmentHandler } from "../../app/commands/update-vehicle-compartment/update-vehicle-compartment.handler.js";
import { UpdateVehicleDetailsCommand } from "../../app/commands/update-vehicle-details/update-vehicle-details.command.js";
import { UpdateVehicleDetailsHandler } from "../../app/commands/update-vehicle-details/update-vehicle-details.handler.js";
import type {
  AddVehicleCompartmentRequest,
  ChangeVehicleAvailabilityRequest,
  CreatedVehicleResponse,
  RegisterVehicleRequest,
  UpdateVehicleCompartmentRequest,
  UpdateVehicleDetailsRequest,
  VehicleCompartmentRouteParams,
  VehicleRouteParams,
} from "./vehicle.http-contracts.js";
import { VehicleHttpMapper } from "./vehicle.http-mapper.js";
import {
  addVehicleCompartmentRequestPipe,
  changeVehicleAvailabilityRequestPipe,
  registerVehicleRequestPipe,
  updateVehicleCompartmentRequestPipe,
  updateVehicleDetailsRequestPipe,
  vehicleCompartmentRouteParamsPipe,
  vehicleRouteParamsPipe,
} from "./schemas/index.js";

@Controller({ path: "vehicles", version: "1" })
export class VehicleController {
  constructor(
    private readonly registerVehicleHandler: RegisterVehicleHandler,
    private readonly updateVehicleDetailsHandler: UpdateVehicleDetailsHandler,
    private readonly changeVehicleAvailabilityHandler: ChangeVehicleAvailabilityHandler,
    private readonly sendVehicleToMaintenanceHandler: SendVehicleToMaintenanceHandler,
    private readonly returnVehicleFromMaintenanceHandler: ReturnVehicleFromMaintenanceHandler,
    private readonly decommissionVehicleHandler: DecommissionVehicleHandler,
    private readonly addVehicleCompartmentHandler: AddVehicleCompartmentHandler,
    private readonly updateVehicleCompartmentHandler: UpdateVehicleCompartmentHandler,
    private readonly removeVehicleCompartmentHandler: RemoveVehicleCompartmentHandler,
  ) {}

  @Post()
  async register(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Body(registerVehicleRequestPipe) request: RegisterVehicleRequest,
  ): Promise<CreatedVehicleResponse> {
    const vehicleId = await this.registerVehicleHandler.exec({
      context: executionContext,
      input: new RegisterVehicleCommand(
        VehicleHttpMapper.toRegisterVehicleInput(request),
      ),
    });
    return VehicleHttpMapper.toCreatedVehicleResponse(vehicleId);
  }

  @Put(":vehicleId")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDetails(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
    @Body(updateVehicleDetailsRequestPipe) request: UpdateVehicleDetailsRequest,
  ): Promise<void> {
    return this.updateVehicleDetailsHandler.exec({
      context: executionContext,
      input: new UpdateVehicleDetailsCommand(params.vehicleId, {
        registrationNumber: request.registrationNumber,
        name: request.name,
        depotId: request.depotId,
      }),
    });
  }

  @Put(":vehicleId/availability")
  @HttpCode(HttpStatus.NO_CONTENT)
  changeAvailability(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
    @Body(changeVehicleAvailabilityRequestPipe)
    request: ChangeVehicleAvailabilityRequest,
  ): Promise<void> {
    return this.changeVehicleAvailabilityHandler.exec({
      context: executionContext,
      input: new ChangeVehicleAvailabilityCommand(
        params.vehicleId,
        request.available,
      ),
    });
  }

  @Put(":vehicleId/maintenance")
  @HttpCode(HttpStatus.NO_CONTENT)
  sendToMaintenance(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
  ): Promise<void> {
    return this.sendVehicleToMaintenanceHandler.exec({
      context: executionContext,
      input: new SendVehicleToMaintenanceCommand(params.vehicleId),
    });
  }

  @Put(":vehicleId/service")
  @HttpCode(HttpStatus.NO_CONTENT)
  returnFromMaintenance(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
  ): Promise<void> {
    return this.returnVehicleFromMaintenanceHandler.exec({
      context: executionContext,
      input: new ReturnVehicleFromMaintenanceCommand(params.vehicleId),
    });
  }

  @Put(":vehicleId/decommissioning")
  @HttpCode(HttpStatus.NO_CONTENT)
  decommission(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
  ): Promise<void> {
    return this.decommissionVehicleHandler.exec({
      context: executionContext,
      input: new DecommissionVehicleCommand(params.vehicleId),
    });
  }

  @Post(":vehicleId/compartments")
  async addCompartment(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
    @Body(addVehicleCompartmentRequestPipe)
    request: AddVehicleCompartmentRequest,
  ): Promise<CreatedVehicleResponse> {
    const compartmentId = await this.addVehicleCompartmentHandler.exec({
      context: executionContext,
      input: new AddVehicleCompartmentCommand(
        params.vehicleId,
        VehicleHttpMapper.toVehicleCompartmentInput(request),
      ),
    });
    return VehicleHttpMapper.toCreatedVehicleResponse(compartmentId);
  }

  @Put(":vehicleId/compartments/:compartmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateCompartment(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleCompartmentRouteParamsPipe)
    params: VehicleCompartmentRouteParams,
    @Body(updateVehicleCompartmentRequestPipe)
    request: UpdateVehicleCompartmentRequest,
  ): Promise<void> {
    return this.updateVehicleCompartmentHandler.exec({
      context: executionContext,
      input: new UpdateVehicleCompartmentCommand(
        params.vehicleId,
        params.compartmentId,
        VehicleHttpMapper.toVehicleCompartmentInput(request),
      ),
    });
  }

  @Delete(":vehicleId/compartments/:compartmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCompartment(
    @CurrentUseCaseContext() executionContext: UseCaseContext,
    @Param(vehicleCompartmentRouteParamsPipe)
    params: VehicleCompartmentRouteParams,
  ): Promise<void> {
    return this.removeVehicleCompartmentHandler.exec({
      context: executionContext,
      input: new RemoveVehicleCompartmentCommand(
        params.vehicleId,
        params.compartmentId,
      ),
    });
  }
}
