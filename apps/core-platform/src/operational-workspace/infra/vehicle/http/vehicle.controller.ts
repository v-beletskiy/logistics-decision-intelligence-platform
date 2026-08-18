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

import { CurrentExecutionContext } from "../../../../shared/access-control/authentication/current-execution-context.decorator";
import type { ExecutionContext } from "../../../../shared/app/execution/execution-context";
import { AddVehicleCompartmentCommand } from "../../../app/vehicle/commands/add-vehicle-compartment/add-vehicle-compartment.command";
import { AddVehicleCompartmentHandler } from "../../../app/vehicle/commands/add-vehicle-compartment/add-vehicle-compartment.handler";
import { ChangeVehicleAvailabilityCommand } from "../../../app/vehicle/commands/change-vehicle-availability/change-vehicle-availability.command";
import { ChangeVehicleAvailabilityHandler } from "../../../app/vehicle/commands/change-vehicle-availability/change-vehicle-availability.handler";
import { DecommissionVehicleCommand } from "../../../app/vehicle/commands/decommission-vehicle/decommission-vehicle.command";
import { DecommissionVehicleHandler } from "../../../app/vehicle/commands/decommission-vehicle/decommission-vehicle.handler";
import { RegisterVehicleCommand } from "../../../app/vehicle/commands/register-vehicle/register-vehicle.command";
import { RegisterVehicleHandler } from "../../../app/vehicle/commands/register-vehicle/register-vehicle.handler";
import { RemoveVehicleCompartmentCommand } from "../../../app/vehicle/commands/remove-vehicle-compartment/remove-vehicle-compartment.command";
import { RemoveVehicleCompartmentHandler } from "../../../app/vehicle/commands/remove-vehicle-compartment/remove-vehicle-compartment.handler";
import { ReturnVehicleFromMaintenanceCommand } from "../../../app/vehicle/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.command";
import { ReturnVehicleFromMaintenanceHandler } from "../../../app/vehicle/commands/return-vehicle-from-maintenance/return-vehicle-from-maintenance.handler";
import { SendVehicleToMaintenanceCommand } from "../../../app/vehicle/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.command";
import { SendVehicleToMaintenanceHandler } from "../../../app/vehicle/commands/send-vehicle-to-maintenance/send-vehicle-to-maintenance.handler";
import { UpdateVehicleCompartmentCommand } from "../../../app/vehicle/commands/update-vehicle-compartment/update-vehicle-compartment.command";
import { UpdateVehicleCompartmentHandler } from "../../../app/vehicle/commands/update-vehicle-compartment/update-vehicle-compartment.handler";
import { UpdateVehicleDetailsCommand } from "../../../app/vehicle/commands/update-vehicle-details/update-vehicle-details.command";
import { UpdateVehicleDetailsHandler } from "../../../app/vehicle/commands/update-vehicle-details/update-vehicle-details.handler";
import type {
  AddVehicleCompartmentRequest,
  ChangeVehicleAvailabilityRequest,
  CreatedVehicleResponse,
  RegisterVehicleRequest,
  UpdateVehicleCompartmentRequest,
  UpdateVehicleDetailsRequest,
  VehicleCompartmentRouteParams,
  VehicleRouteParams,
} from "./vehicle.http-contracts";
import { VehicleHttpMapper } from "./vehicle.http-mapper";
import {
  addVehicleCompartmentRequestPipe,
  changeVehicleAvailabilityRequestPipe,
  registerVehicleRequestPipe,
  updateVehicleCompartmentRequestPipe,
  updateVehicleDetailsRequestPipe,
  vehicleCompartmentRouteParamsPipe,
  vehicleRouteParamsPipe,
} from "./schemas";

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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(vehicleRouteParamsPipe) params: VehicleRouteParams,
  ): Promise<void> {
    return this.decommissionVehicleHandler.exec({
      context: executionContext,
      input: new DecommissionVehicleCommand(params.vehicleId),
    });
  }

  @Post(":vehicleId/compartments")
  async addCompartment(
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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
    @CurrentExecutionContext() executionContext: ExecutionContext,
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