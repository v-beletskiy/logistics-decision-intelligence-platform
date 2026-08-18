import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { CurrentExecutionContext } from "../../../../shared/access-control/authentication/current-execution-context.decorator";
import type { ExecutionContext } from "../../../../shared/app/execution/execution-context";
import { CancelAssignmentCommand } from "../../../app/assignment/commands/cancel-assignment/cancel-assignment.command";
import { CancelAssignmentHandler } from "../../../app/assignment/commands/cancel-assignment/cancel-assignment.handler";
import { CompleteAssignmentCommand } from "../../../app/assignment/commands/complete-assignment/complete-assignment.command";
import { CompleteAssignmentHandler } from "../../../app/assignment/commands/complete-assignment/complete-assignment.handler";
import { CreateAssignmentCommand } from "../../../app/assignment/commands/create-assignment/create-assignment.command";
import { CreateAssignmentHandler } from "../../../app/assignment/commands/create-assignment/create-assignment.handler";
import { ReassignDriverCommand } from "../../../app/assignment/commands/reassign-driver/reassign-driver.command";
import { ReassignDriverHandler } from "../../../app/assignment/commands/reassign-driver/reassign-driver.handler";
import { ReassignVehicleCommand } from "../../../app/assignment/commands/reassign-vehicle/reassign-vehicle.command";
import { ReassignVehicleHandler } from "../../../app/assignment/commands/reassign-vehicle/reassign-vehicle.handler";
import { StartAssignmentCommand } from "../../../app/assignment/commands/start-assignment/start-assignment.command";
import { StartAssignmentHandler } from "../../../app/assignment/commands/start-assignment/start-assignment.handler";
import type {
  AssignmentRouteParams,
  CreateAssignmentRequest,
  CreatedAssignmentResponse,
  ReassignDriverRequest,
  ReassignVehicleRequest,
} from "./assignment.http-contracts";
import { AssignmentHttpMapper } from "./assignment.http-mapper";
import {
  assignmentRouteParamsPipe,
  createAssignmentRequestPipe,
  reassignDriverRequestPipe,
  reassignVehicleRequestPipe,
} from "./schemas";

@Controller({ path: "assignments", version: "1" })
export class AssignmentController {
  constructor(
    private readonly createAssignmentHandler: CreateAssignmentHandler,
    private readonly startAssignmentHandler: StartAssignmentHandler,
    private readonly completeAssignmentHandler: CompleteAssignmentHandler,
    private readonly cancelAssignmentHandler: CancelAssignmentHandler,
    private readonly reassignVehicleHandler: ReassignVehicleHandler,
    private readonly reassignDriverHandler: ReassignDriverHandler,
  ) {}

  @Post()
  async create(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Body(createAssignmentRequestPipe) request: CreateAssignmentRequest,
  ): Promise<CreatedAssignmentResponse> {
    const assignmentId = await this.createAssignmentHandler.exec({
      context: executionContext,
      input: new CreateAssignmentCommand(
        request.routeId,
        request.vehicleId,
        request.driverId,
        request.initiatedByUserId,
      ),
    });
    return AssignmentHttpMapper.toCreatedAssignmentResponse(assignmentId);
  }

  @Put(":assignmentId/start")
  @HttpCode(HttpStatus.NO_CONTENT)
  start(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(assignmentRouteParamsPipe) params: AssignmentRouteParams,
  ): Promise<void> {
    return this.startAssignmentHandler.exec({
      context: executionContext,
      input: new StartAssignmentCommand(params.assignmentId),
    });
  }

  @Put(":assignmentId/completion")
  @HttpCode(HttpStatus.NO_CONTENT)
  complete(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(assignmentRouteParamsPipe) params: AssignmentRouteParams,
  ): Promise<void> {
    return this.completeAssignmentHandler.exec({
      context: executionContext,
      input: new CompleteAssignmentCommand(params.assignmentId),
    });
  }

  @Put(":assignmentId/cancellation")
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(assignmentRouteParamsPipe) params: AssignmentRouteParams,
  ): Promise<void> {
    return this.cancelAssignmentHandler.exec({
      context: executionContext,
      input: new CancelAssignmentCommand(params.assignmentId),
    });
  }

  @Put(":assignmentId/vehicle")
  @HttpCode(HttpStatus.NO_CONTENT)
  reassignVehicle(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(assignmentRouteParamsPipe) params: AssignmentRouteParams,
    @Body(reassignVehicleRequestPipe) request: ReassignVehicleRequest,
  ): Promise<void> {
    return this.reassignVehicleHandler.exec({
      context: executionContext,
      input: new ReassignVehicleCommand(
        params.assignmentId,
        request.vehicleId,
        request.initiatedByUserId,
      ),
    });
  }

  @Put(":assignmentId/driver")
  @HttpCode(HttpStatus.NO_CONTENT)
  reassignDriver(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(assignmentRouteParamsPipe) params: AssignmentRouteParams,
    @Body(reassignDriverRequestPipe) request: ReassignDriverRequest,
  ): Promise<void> {
    return this.reassignDriverHandler.exec({
      context: executionContext,
      input: new ReassignDriverCommand(
        params.assignmentId,
        request.driverId,
        request.initiatedByUserId,
      ),
    });
  }
}